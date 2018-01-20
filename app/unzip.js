/* global fetch, Headers */

const pify = require('pify')
const yauzl = require('yauzl')
const concat = require('simple-concat')
const stream = require('stream')

// Shim setImmediate() for `yauzl`
global.setImmediate = process.nextTick.bind(process)

const concatAsync = pify(concat)
const zipFromRandomAccessReaderAsync = pify(yauzl.fromRandomAccessReader)

module.exports = { openZip, getFile, readEntries }

/**
 * Opens a zip file
 */
async function openZip (zipPath) {
  // TODO: use HEAD requests once Beaker supports them
  // https://github.com/beakerbrowser/beaker/issues/826
  // const zipSize = await fetchZipSize(zipPath)
  // console.log('fetched zip size', zipSize)

  let zipSize
  try {
    zipSize = await fetchZipSize(zipPath)
    console.log('fetched zip size: ' + zipSize)
  } catch (_) {
    zipSize = 3470744536
    console.log('fallback hardcoded zip size: ' + zipSize)
  }

  const reader = new ZipRandomAccessReader(zipPath)
  const zipFile = await zipFromRandomAccessReaderAsync(
    reader,
    zipSize,
    { lazyEntries: true }
  )
  zipFile._entriesPromise = readEntries(zipFile)
  return zipFile
}

async function fetchZipSize (zipPath) {
  const response = await fetch(zipPath, { method: 'HEAD' })
  const size = Number(response.headers.get('content-length'))
  return size
}

/**
 * Given a zip file and a filename, extracts file data
 */
async function getFile (zipFile, fileName) {
  const entry = await findEntry(zipFile, fileName)

  if (entry == null) {
    throw new Error('file not found: ' + fileName)
  }

  const openReadStream = pify(zipFile.openReadStream.bind(zipFile))
  const readStream = await openReadStream(entry)

  const fileData = await concatAsync(readStream)
  return fileData
}

async function findEntry (zipFile, fileName) {
  const entries = await zipFile._entriesPromise
  console.log(entries[0].fileName)
  const entry = entries.find(entry => entry.fileName === fileName)
  // const entry2 = Object.create(yauzl.Entry.prototype, {
  //   compressedSize: { value: entry.compressedSize },
  //   relativeOffsetOfLocalHeader: { value: entry.relativeOffsetOfLocalHeader },
  //   compressionMethod: { value: entry.compressionMethod },
  //   generalPurposeBitFlag: { value: entry.generalPurposeBitFlag }
  // })
  return entry
}

// In zip file entries, directory file names end with '/'
const RE_DIRECTORY_NAME = /\/$/

async function readEntries (zipFile) {
  return new Promise((resolve, reject) => {
    const entries = []

    let remainingEntries = zipFile.entryCount

    zipFile.readEntry()
    zipFile.on('entry', onEntry)
    zipFile.once('error', onError)

    function onEntry (entry) {
      remainingEntries -= 1

      if (RE_DIRECTORY_NAME.test(entry.fileName)) {
        // This is a directory entry
        // Note that entires for directories themselves are optional.
        // An entry's fileName implicitly requires its parent directories to exist.
      } else {
        // This is a file entry
        entries.push(entry)
      }

      if (remainingEntries === 0) {
        cleanup()
        resolve(entries)
      } else {
        // Continue reading entries
        zipFile.readEntry()
      }
    }

    function onError (err) {
      cleanup()
      reject(err)
    }

    function cleanup () {
      zipFile.removeListener('entry', onEntry)
      zipFile.removeListener('error', onError)
    }
  })
}

const PAGE_SIZE = 1 << 16

class ZipRandomAccessReader extends yauzl.RandomAccessReader {
  constructor (zipPath) {
    super()
    this._zipPath = zipPath
    this._pagePromiseCache = []
  }

  _readStreamForRange (start, end) {
    const through = new stream.PassThrough()

    // Convert [start, end) to [start, end]
    readBufsForRange(this, start, end - 1)
      .then((pages) => {
        pages.forEach(page => through.write(page))
        through.end()
      })

    return through
  }

  read (buffer, offset, length, position, callback) {
    readBufsForRange(this, position, position + length - 1)
      .then(pages => {
        pages.forEach(page => {
          page.copy(buffer, offset)
          offset += page.length
        })
        callback()
      })
  }
}

/**
 * Reads bit range [start, end], inclusive. Returns buffers to concat.
 */
async function readBufsForRange (reader, start, end) {
  // Kick off any fetches not yet started
  const pageStart = Math.floor(start / PAGE_SIZE)
  const pageEnd = Math.floor(end / PAGE_SIZE)
  for (let page = pageStart; page <= pageEnd; page++) {
    let promise = reader._pagePromiseCache[page]
    if (promise == null) {
      promise = reader._pagePromiseCache[page] = readPage(reader, page)
    }
  }

  // Return buffers
  const ret = new Array(pageEnd - pageStart + 1)
  for (let page = pageStart; page <= pageEnd; page++) {
    const promise = reader._pagePromiseCache[page]
    let buf = await promise
    if (page === pageStart && page === pageEnd) {
      buf = buf.slice(start - (page * PAGE_SIZE), end - (page * PAGE_SIZE) + 1)
    } else if (page === pageStart) {
      buf = buf.slice(start - (pageStart * PAGE_SIZE), 1 * PAGE_SIZE)
    } else if (page === pageEnd) {
      buf = buf.slice(0, end - (pageEnd * PAGE_SIZE) + 1)
    }
    ret[page - pageStart] = buf
  }
  return ret
}

async function readPage (reader, page) {
  console.log('loading page ' + page)

  const start = page * PAGE_SIZE
  const end = ((page + 1) * PAGE_SIZE) - 1
  const headers = new Headers({
    'Range': `bytes=${start}-${end}`
  })

  // TODO: use simple-get (which uses john's stream-http internally) to
  // return a proper stream back, instead of this solution which waits for
  // the full range request to return before returning the data
  const res = await window.fetch(reader._zipPath, { headers })
  const abuf = await res.arrayBuffer()
  const buf = Buffer.from(abuf)

  console.log(`loaded ${start} to ${end}, ` +
      `expected ${end - start + 1}b, got ${buf.length}b`)

  return buf
}

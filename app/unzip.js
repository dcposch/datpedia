const pify = require('pify')
const yauzl = require('yauzl')
const concat = require('simple-concat')
const stream = require('stream')

// Shim setImmediate() for `yauzl`
global.setImmediate = process.nextTick.bind(process)

const concatAsync = pify(concat)
const zipFromRandomAccessReaderAsync = pify(yauzl.fromRandomAccessReader)

module.exports = { openZip, getFileData }

/**
 * Given a filename and a loaded (or loading) ZipRandomAccessReader,
 * extracts file data.
 */
async function getFileData (fileName, zipFilePromise) {
  const zipFile = await zipFilePromise

  // zip entries don't have leading slash
  if (fileName[0] === '/') fileName = fileName.slice(1)

  const fileData = await getFileData(zipFile, fileName)
}

/**
 * Opens a ZipRandomAccessReader
 */
async function openZip (zipPath, zipSize) {
  const reader = new ZipRandomAccessReader(zipPath)
  const zipFile = zipFromRandomAccessReaderAsync(
    reader,
    zipSize,
    { lazyEntries: true }
  )
  return zipFile
}

async function getFileData (zipFile, fileName) {
  const entry = await getEntry(zipFile, fileName)

  if (entry == null) {
    throw new Error('file not found: ' + fileName)
  }

  const openReadStream = pify(zipFile.openReadStream.bind(zipFile))
  const readStream = await openReadStream(entry)

  const fileData = await concatAsync(readStream)
  return fileData
}

async function getEntry (zipFile, fileName) {
  const entries = await readEntries(zipFile)
  console.log(entries[0].fileName)
  const entry = entries.find(entry => entry.fileName === fileName)
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

const PAGE_BITS = 16

class ZipRandomAccessReader extends yauzl.RandomAccessReader {
  constructor (zipPath) {
    super()
    this._zipPath = zipPath
  }

  _readStreamForRange (start, end) {
    const through = new stream.PassThrough()

    // Convert [start, end) to [start, end]
    readBufsForRange(this._zipPath, start, end - 1)
      .then((pages) => {
        pages.forEach(page => through.write(page))
        through.end()
      })

    return through
  }

  /* read (buffer, offset, length, position, callback) {

  } */
}

// TODO: LRU
const _pagePromiseCache = []

/**
 * Reads bit range [start, end], inclusive. Returns buffers to concat.
 */
async function readBufsForRange (path, start, end) {
  // Kick off any fetches not yet started
  const pageStart = start >> PAGE_BITS
  const pageEnd = end >> PAGE_BITS
  for (let page = pageStart; page <= pageEnd; page++) {
    let promise = _pagePromiseCache[page]
    if (promise == null) {
      promise = _pagePromiseCache[page] = readPage(path, page)
    }
  }

  // Return buffers
  const ret = new Array(pageEnd - pageStart + 1)
  for (let page = pageStart; page <= pageEnd; page++) {
    let buf = await _pagePromiseCache[page]
    if (page === pageStart && page === pageEnd) {
      buf = buf.slice(start - (page << PAGE_BITS), end - (page << PAGE_BITS) + 1)
    } else if (page === pageStart) {
      buf = buf.slice(start - (pageStart << PAGE_BITS), 1 << PAGE_BITS)
    } else if (page === pageEnd) {
      buf = buf.slice(0, end - (pageEnd << PAGE_BITS) + 1)
    }
    ret[page - pageStart] = buf
  }
  return ret
}

async function readPage (path, page) {
  console.log('loading page ' + page)

  const start = page << PAGE_BITS
  const end = ((page + 1) << PAGE_BITS) - 1
  const headers = new Headers({
    'Range': `bytes=${start}-${end}`
  })

  // TODO: use simple-get (which uses john's stream-http internally) to
  // return a proper stream back, instead of this solution which waits for
  // the full range request to return before returning the data
  const res = await window.fetch(path, { headers })
  const abuf = await res.arrayBuffer()
  const buf = Buffer.from(abuf)

  console.log(`loaded ${start} to ${end}, ` +
      `expected ${end - start + 1}b, got ${buf.length}b`)

  return buf
}

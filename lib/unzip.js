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
  // TODO: remove hardcode once Beaker supports HEAD requests
  // https://github.com/beakerbrowser/beaker/issues/826

  let zipSize = await fetchZipSize(zipPath)
  if (zipSize === 0) {
    zipSize = 169316988448
    console.log('fallback hardcoded zip size: ' + zipSize)
  } else {
    console.log('fetched zip size: ' + zipSize)
  }

  const reader = new ZipRandomAccessReader(zipPath)
  const zipFile = await zipFromRandomAccessReaderAsync(reader, zipSize, {
    lazyEntries: true
  })
  zipFile.openReadStreamAsync = pify(zipFile.openReadStream.bind(zipFile))

  return zipFile
}

async function fetchZipSize (zipPath) {
  const response = await window.fetch(zipPath, { method: 'HEAD' })
  const size = Number(response.headers.get('content-length'))
  return size
}

/**
 * Given a zip file and a filename, extracts file data
 */
async function getFile (zipFile, entryData) {
  const entryValues = {}
  Object.keys(entryData).forEach(k => {
    entryValues[k] = { value: entryData[k] }
  })
  const entry = Object.create(yauzl.Entry.prototype, entryValues)

  const readStream = await zipFile.openReadStreamAsync(entry)

  const fileData = await concatAsync(readStream)
  return fileData
}

// In zip file entries, directory file names end with '/'
const RE_DIRECTORY_NAME = /\/$/

async function readEntries (zipFile, fn) {
  fn = fn || (a => a)
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
        entries.push(fn(entry))
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

const PAGE_SIZE = 1 << 18

class ZipRandomAccessReader extends yauzl.RandomAccessReader {
  constructor (zipPath) {
    super()
    this._zipPath = zipPath
    this._pagePromiseCache = []
  }

  _readStreamForRange (start, end) {
    const through = new stream.PassThrough()

    // Convert [start, end) to [start, end]
    readBufsForRange(this, start, end - 1).then(pages => {
      pages.forEach(page => through.write(page))
      through.end()
    })

    return through
  }

  read (buffer, offset, length, position, callback) {
    readBufsForRange(this, position, position + length - 1).then(pages => {
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
      buf = buf.slice(start - page * PAGE_SIZE, end - page * PAGE_SIZE + 1)
    } else if (page === pageStart) {
      buf = buf.slice(start - pageStart * PAGE_SIZE, 1 * PAGE_SIZE)
    } else if (page === pageEnd) {
      buf = buf.slice(0, end - pageEnd * PAGE_SIZE + 1)
    }
    ret[page - pageStart] = buf
  }
  return ret
}

async function readPage (reader, page) {
  console.log('loading page ' + page)

  const start = page * PAGE_SIZE
  const end = (page + 1) * PAGE_SIZE - 1
  const headers = new window.Headers({
    Range: `bytes=${start}-${end}`
  })

  // TODO: use simple-get (which uses john's stream-http internally) to
  // return a proper stream back, instead of this solution which waits for
  // the full range request to return before returning the data
  const res = await window.fetch(reader._zipPath, { headers })
  const abuf = await res.arrayBuffer()
  const buf = Buffer.from(abuf)

  console.log(
    `loaded ${start} to ${end}, ` +
      `expected ${end - start + 1}b, got ${buf.length}b`
  )

  return buf
}

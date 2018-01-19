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
  // const zipFile = zipFromBufferAsync(RAW_ZIP, { lazyEntries: true })
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
      console.log('entry:')
      console.log(entry)

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

class ZipRandomAccessReader extends yauzl.RandomAccessReader {
  constructor (zipPath) {
    super()
    this._zipPath = zipPath
  }

  _readStreamForRange (start, end) {
    const headers = new Headers({
      'Range': `bytes=${start}-${end - 1}`
    })

    const through = new stream.PassThrough()

    // TODO: use simple-get (which uses john's stream-http internally) to
    // return a proper stream back, instead of this solution which waits for
    // the full range request to return before returning the data
    window.fetch(this._zipPath, { headers })
      .then(res => {
        res.arrayBuffer()
          .then(abuf => {
            through.end(Buffer.from(abuf))
          })
      })

    return through
  }
}

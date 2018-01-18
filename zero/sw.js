/* global Response, URL */

// Shim setImmediate() for `yauzl`
global.setImmediate = process.nextTick.bind(process)

const fs = require('fs')
const pify = require('pify')
const yauzl = require('yauzl')
const concat = require('simple-concat')

const concatAsync = pify(concat)
const zipFromBufferAsync = pify(yauzl.fromBuffer)

const RAW_ZIP = fs.readFileSync('./test.zip')

// const wikiDatAddr = '/wikipedia_en_simple_all_2017-01.zim'

global.addEventListener('install', event => {
  console.log('Service worker installed.')
  global.skipWaiting()
})

global.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  console.log('Service worker fetch', url.pathname)

  if (url.pathname === '/index.js') {
    // event.respondWith(getResponse(request.url))
    // const response = new Response('synthetic response', {
    //   // status/statusText default to 200/OK, but we're explicitly setting them here.
    //   status: 200,
    //   statusText: 'OK',
    //   headers: {
    //     'Content-Type': 'text/html',
    //     'X-Mock-Response': 'yes'
    //   }
    // })

    console.log('sending fake response')
    event.respondWith(getResponse(url.pathname))
  }

  // If our if() condition is false, then this fetch handler won't intercept the
  // request. If there are any other fetch handlers registered, they will get a
  // chance to call event.respondWith(). If no fetch handlers call
  // event.respondWith(), the request will be handled by the browser as if there were
  // no service worker involvement.
})

async function getResponse (fileName) {
  const zipFile = await openZip()

  // zip entries don't have leading slash
  if (fileName[0] === '/') fileName = fileName.slice(1)

  const fileData = await getFileData(zipFile, fileName)
  const response = new Response(fileData.toString())
  return response
}

async function openZip () {
  const zipFile = zipFromBufferAsync(RAW_ZIP, { lazyEntries: true })
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

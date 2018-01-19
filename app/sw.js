const {openZip, getFileData} = require('./unzip.js')

/* global Response, URL, Headers, fetch */

const ZIP_PATH = '/wiki.zip'
const ZIP_SIZE = 1757653124

const zipFilePromise = openZip(ZIP_PATH, ZIP_SIZE)

const FILENAME_BLACKLIST = [
  'index.html',
  'main.js',
  'sw-bundle.js',
  ZIP_PATH
]

global.addEventListener('install', event => {
  console.log('Service worker installed.')
  global.skipWaiting()
})

global.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  console.log('service worker fetch', url.pathname)

  if (!FILENAME_BLACKLIST.includes(url.pathname)) {
    const response = getResponse(url.pathname)
    event.respondWith(response)
  }

  // If our if() condition is false, then this fetch handler won't intercept the
  // request. If there are any other fetch handlers registered, they will get a
  // chance to call event.respondWith(). If no fetch handlers call
  // event.respondWith(), the request will be handled by the browser as if there were
  // no service worker involvement.
})

async function getResponse (fileName) {
  const fileData = await getFileData(fileName, zipFilePromise)
  const response = new Response(fileData.toString())
  return response
}

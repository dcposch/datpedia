const normalizeForSearch = require('normalize-for-search')
const React = require('react')
const ReactDOM = require('react-dom')

const App = require('./App.js')

const {openZip, getFileData} = require('./unzip.js')

const ZIP_PATH = '/wiki.zip'
// const ZIP_SIZE = 1757653124 // Simple English Wiki
const ZIP_SIZE = 4176011 // Ray Charles

const zipFilePromise = openZip(ZIP_PATH, ZIP_SIZE)

const store = window.store = {
  urlName: null, // null for the home page, or eg "Star_Wars" for that article
  searchIndexes: {
    partial: [], // list of *top* articles, search normalized and sorted
    full: [] // list of *all* articles, search normalized and sorted
  },
  articleCache: {} // article HTML cache, eg "Star_Wars": "<html>..."
}

init()

async function init () {
  if (!window.DatArchive) {
    console.log('old web, not loading dat...')
  } else {
    initDat()
  }

  window.addEventListener('hashchange', routeAndRender)
  routeAndRender()

  await initSearchIndex('/list.txt', 'partial')
  await initSearchIndex('/list-all.txt', 'full')
}

function initDat () {
  // Get the url of the current archive
  const datUrl = window.location.origin

  const archive = new window.DatArchive(datUrl)

  // Listen to network events, for debugging purposes...
  const networkActivity = archive.createNetworkActivityStream()

  networkActivity.addEventListener('network-changed', ({connections}) => {
    console.log(connections, 'current peers')
  })
  networkActivity.addEventListener('download', ({feed, block, bytes}) => {
    console.log('downloaded a block in the', feed, {block, bytes})
  })
  networkActivity.addEventListener('upload', ({feed, block, bytes}) => {
    console.log('uploaded a block in the', feed, {block, bytes})
  })
  networkActivity.addEventListener('sync', ({feed}) => {
    console.log('downloaded everything currently published in the', feed)
  })

  // Watch the search index for changes...
  const searchActivity = archive.createFileActivityStream([
    '/list.txt',
    '/list-all.txt'
  ])

  // And when there's a change, download the new version of the file...
  searchActivity.addEventListener('invalidated', ({path}) => {
    console.log(path, 'has been invalidated, downloading the update')
    archive.download(path)
  })

  // And when the download is done, use the new search index!
  searchActivity.addEventListener('changed', ({path}) => {
    console.log(path, 'has changed')
    if (path === '/list.txt') initSearchIndex(path, 'partial')
    if (path === '/list-all.txt') initSearchIndex(path, 'full')
  })
}

async function initSearchIndex (listPath, indexName) {
  const res = await window.fetch(listPath)
  if (res.status !== 200) {
    console.error('Error fetching list.txt', res)
    return
  }

  const articlesStr = await res.text()

  let articles = articlesStr
    .split('\n')
    .slice(0, -1) // remove extra empty item caused by trailing \n

  const searchIndex = articles
    .map(urlName => {
      const name = urlName.replace(/_/g, ' ')
      const searchName = normalizeForSearch(name)
      return {
        urlName,
        name,
        searchName
      }
    })

  store.searchIndexes[indexName] = searchIndex

  console.log(
    'loaded search index %s, %d entries',
    indexName,
    store.searchIndexes[indexName].length
  )
}

/**
 * TODO: maybe use ServiceWorker once Beaker allows it
 * See: https://github.com/beakerbrowser/beaker/issues/46
 *
 * async function registerServiceWorker () {
 *   if (!navigator.serviceWorker) throw new Error('No service worker support')
 *   return navigator.serviceWorker.register(
 *     '/sw-bundle.js',
 *     { scope: '/' }
 *   )
 * }
 */

function render () {
  const root = document.querySelector('#root')
  const app = <App store={store} dispatch={dispatch} />
  ReactDOM.render(app, root)
}

function dispatch (action, data) {
  console.log('dispatch', action, data)
  switch (action) {
    case 'NAVIGATE':
      window.location = data
      return
    default:
      throw new Error('unknown action ' + action)
  }
}

function routeAndRender () {
  // Route
  const {hash} = window.location
  store.urlName = (hash && hash.length > 1) ? hash.substring(1) : null
  console.log('routing', store.urlName)

  // Start loading the article asynchronously
  if (store.urlName != null) loadArticle(store.urlName)

  // Render immediately
  render()
}

async function loadArticle (urlName) {
  if (store.articleCache[urlName] != null) {
    return
  }

  console.log(`loading article ${urlName}`)
  const zipFile = await zipFilePromise
  const html = await getFileData(zipFile, 'A/' + urlName + '.html')
  console.log(`loaded article ${urlName}, got ${html && html.length} b`)
  store.articleCache[urlName] = html

  render()
}

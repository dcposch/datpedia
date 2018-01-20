const React = require('react')
const ReactDOM = require('react-dom')
const webworkify = require('webworkify')
const { Comlink } = require('comlinkjs')

const App = require('./app.js')
const {openZip, getFileData} = require('./unzip.js')

const ZIP_PATH = '/wiki.zip'
const ZIP_SIZE = 370423696 // Simple English Wiki
// const ZIP_SIZE = 4176011 // Ray Charles

const SEARCH_INDEX_PATHS = {
  partial: '/list.txt',
  full: '/list-all.txt'
}

const worker = Comlink.proxy(webworkify(require('./worker.js')))
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

  await initSearchIndex('partial')
  await initSearchIndex('full')
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
  const searchActivity = archive.createFileActivityStream(
    Object.values(SEARCH_INDEX_PATHS)
  )

  // And when there's a change, download the new version of the file...
  searchActivity.addEventListener('invalidated', ({path}) => {
    console.log(path, 'has been invalidated, downloading the update')
    archive.download(path)
  })

  // And when the download is done, use the new search index!
  searchActivity.addEventListener('changed', ({path}) => {
    console.log(path, 'has changed')
    if (path === SEARCH_INDEX_PATHS.partial) initSearchIndex('partial')
    if (path === SEARCH_INDEX_PATHS.full) initSearchIndex('full')
  })
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
async function initSearchIndex (indexName) {
  const indexPath = SEARCH_INDEX_PATHS[indexName]
  const url = window.location.origin + indexPath
  const searchIndex = await worker.fetchSearchIndex(url)
  store.searchIndexes[indexName] = searchIndex
  console.log(
    'loaded search index %s, %d entries',
    indexName,
    searchIndex.length
  )
}

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

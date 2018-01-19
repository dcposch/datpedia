const normalizeForSearch = require('normalize-for-search')
const React = require('react')
const ReactDOM = require('react-dom')

const App = require('./App.js')
const { searchIndexSort } = require('./util')

const store = {
  archive: null,
  searchIndex: []
}

init()

function init () {
  if (!window.DatArchive) {
    console.log('old web, not loading dat...')
  } else {
    initDat()
  }

  initSearchIndex()
  window.addEventListener('hashchange', render)
  render()
}

function initDat () {
  // Get the url of the current archive
  const datUrl = window.location.origin

  store.archive = new window.DatArchive(datUrl)

  // Listen to network events, for debugging purposes...
  const networkActivity = store.archive.createNetworkActivityStream()

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
  const searchActivity = store.archive.createFileActivityStream('/list.txt')

  // And when there's a change, download the new version of the file...
  searchActivity.addEventListener('invalidated', ({path}) => {
    console.log(path, 'has been invalidated, downloading the update')
    store.archive.download(path)
  })

  // And when the download is done, use the new search index!
  searchActivity.addEventListener('changed', ({path}) => {
    console.log(path, 'has changed')
    if (path === '/list.txt') initSearchIndex()
  })
}

async function initSearchIndex () {
  const res = await window.fetch('/list.txt')
  if (res.status !== 200) {
    console.error('Error fetching list.txt', res)
    return
  }

  const articlesStr = await res.text()

  let articles = articlesStr
    .split('\n')
    .slice(0, -1) // remove extra empty item caused by trailing \n

  store.searchIndex = articles
    .map(urlName => {
      const name = decodeURIComponent(urlName.replace(/_/g, ' '))
      const searchName = normalizeForSearch(name)
      return {
        urlName,
        name,
        searchName
      }
    })
    // TODO: remove this sort once list.txt is sorted correctly using this same
    // sort function
    .sort(searchIndexSort)

  console.log('loaded search index, %d entries', store.searchIndex.length)
  render()
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
  const {hash} = window.location
  const urlName = (hash && hash.length > 1) ? hash.substring(1) : null
  const root = document.querySelector('#root')
  const app = <App urlName={urlName} store={store} dispatch={dispatch} />
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

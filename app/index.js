const normalizeForSearch = require('normalize-for-search')

const React = require('react')
const ReactDOM = require('react-dom')

const App = require('./app.js')

const store = {
  archive: null,
  searchIndex: []
}

init()

function init () {
  initDat()
  initSearchIndex()
  render()
}

function initDat () {
  // Get the url of the current archive
  const datUrl = window.location.origin

  store.archive = new DatArchive(datUrl)

  // Listen to network events, for debugging purposes...
  const networkActivity = store.archive.createNetworkActivityStream()

  networkActivity.addEventListener('network-changed', ({connections}) => {
    console.log(connections, 'current peers')
  })
  networkActivity.addEventListener('download', ({feed, block, bytes}) => {
    console.log('Downloaded a block in the', feed, {block, bytes})
  })
  networkActivity.addEventListener('upload', ({feed, block, bytes}) => {
    console.log('Uploaded a block in the', feed, {block, bytes})
  })
  networkActivity.addEventListener('sync', ({feed}) => {
    console.log('Downloaded everything currently published in the', feed)
  })

  // Watch the search index for changes...
  const searchActivity = store.archive.createFileActivityStream('/search.json')

  // And when there's a change, download the new version of the file...
  searchActivity.addEventListener('invalidated', ({path}) => {
    console.log(path, 'has been invalidated, downloading the update')
    store.archive.download(path)
  })

  // And when the download is done, use the new search index!
  searchActivity.addEventListener('changed', ({path}) => {
    console.log(path, 'has been updated!')
    if (path === '/search.json') initSearchIndex()
  })
}

async function initSearchIndex () {
  const articlesStr = await store.archive.readFile('search.json')
  let articles = JSON.parse(articlesStr)

  store.searchIndex = articles.map(url => {
    const name = url.replace(/\.html$/, '').replace(/_/g, ' ')
    const searchName = normalizeForSearch(name)
    return {
      name,
      searchName,
      url
    }
  })

  render()
}

function render () {
  const root = document.querySelector('#root')
  ReactDOM.render(<App store={store} dispatch={dispatch} />, root)
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

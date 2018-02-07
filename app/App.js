const React = require('react')
const SearchPage = require('./SearchPage.js')
const ArticlePage = require('./ArticlePage.js')

module.exports = function App (props) {
  const { store, dispatch } = props
  const { urlName } = store
  console.log('rendering', urlName || 'search page')

  if (urlName != null) {
    return <ArticlePage store={store} dispatch={dispatch} />
  } else {
    return <SearchPage store={store} dispatch={dispatch} />
  }
}

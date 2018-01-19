const React = require('react')
const SearchPage = require('./SearchPage.js')
const ArticlePage = require('./ArticlePage.js')

module.exports = function App (props) {
  const {urlName, store, dispatch} = props
  console.log('rendering', urlName)

  if (urlName) {
    return <ArticlePage store={store} dispatch={dispatch} urlName={urlName} />
  } else {
    return <SearchPage store={store} dispatch={dispatch} />
  }
}

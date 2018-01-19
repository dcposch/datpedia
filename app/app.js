const React = require('react')
const SearchPage = require('./SearchPage.js')

module.exports = function App (props) {
  const {article, store, dispatch} = props
  console.log('rendering', article)

  if (article) {
    return <h1>{article}</h1>
  } else {
    return <SearchPage store={store} dispatch={dispatch} />
  }
}

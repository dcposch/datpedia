const React = require('react')
const SearchBox = require('./SearchBox.js')

/**
 * Shows a Wikipedia article, with a search bar at the top.
 */
module.exports = class ArticlePage extends React.Component {
  render () {
    const {store, dispatch} = this.props
    const {articleCache, searchIndexes, urlName} = store

    const name = urlName.replace(/_/g, ' ')

    const html = articleCache[urlName] || 'Loading...'

    return (
      <div className='ArticlePage'>
        <header>
          <a href='#'>datpedia</a>
          <SearchBox searchIndexes={searchIndexes} dispatch={dispatch} />
        </header>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </div>
    )
  }
}

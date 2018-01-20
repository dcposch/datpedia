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

    const html = articleCache[urlName]

    return (
      <div className='ArticlePage'>
        <header>
          <a href='#'>datpedia</a>
          <SearchBox searchIndexes={searchIndexes} dispatch={dispatch} />
        </header>
        { html != null && (<div
          className='ArticleBody'
          dangerouslySetInnerHTML={{__html: html}} />)
        }
        { html == null && <div><h1>{name}</h1><p>Loading...</p></div> }
      </div>
    )
  }
}

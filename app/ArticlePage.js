const React = require('react')
const SearchBox = require('./SearchBox.js')

/**
 * Shows a Wikipedia article, with a search bar at the top.
 */
module.exports = class ArticlePage extends React.Component {
  render () {
    const {urlName, store, dispatch} = this.props

    const name = decodeURIComponent(urlName.replace(/_/g, ' '))

    const {article} = store
    const html = article == null ? '' : article.html

    return (
      <div className='ArticlePage'>
        <header>
          <a href='#'>datpedia</a>
          <SearchBox items={store.searchIndex} dispatch={dispatch} />
        </header>
        <h1>{name}</h1>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </div>
    )
  }
}

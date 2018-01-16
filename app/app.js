const React = require('react')

const Search = require('./search')

module.exports = class App extends React.Component {
  constructor (props) {
    super(props)
    this.onSearch = this.onSearch.bind(this)
  }

  render () {
    const { store, dispatch } = this.props
    return (
      <div>
        <h1>datpedia</h1>

        <Search items={store.searchIndex} onSearch={this.onSearch} />

        <section className="footerLinks">
          <small>
            <a href="/A">Article Index</a>
          </small>
        </section>
      </div>
    )
  }

  onSearch (item) {
    const { dispatch } = this.props
    dispatch('NAVIGATE', '/A/' + item.url)
  }
}

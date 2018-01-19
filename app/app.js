const React = require('react')

const Search = require('./search')

module.exports = class App extends React.Component {
  constructor (props) {
    super(props)
    this._onSelectBound = this.onSelect.bind(this)
  }

  render () {
    const { store } = this.props

    const styleGlobe = {
      position: 'absolute',
      top: 0,
      left: '10%',
      bottom: 0,
      right: '10%',
      backgroundImage: 'url(./sphere.gif)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      zIndex: -2
    }

    const styleBlur = {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      filter: 'blur(8px)',
      zIndex: -1
    }

    return (
      <div>
        <div style={styleBlur} >
          <div style={styleGlobe} />
        </div>

        <h1>datpedia</h1>

        <h2>
          wikipedia over dat://<br />
          <hr />
          a peer-to-peer encyclopedia<br />
          for the peer-to-peer web
        </h2>

        <Search items={store.searchIndex} onSelect={this._onSelectBound} />
      </div>
    )
  }

  onSelect (item) {
    const { dispatch } = this.props
    dispatch('NAVIGATE', '#' + item.urlName)
  }
}

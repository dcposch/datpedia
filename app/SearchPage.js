const React = require('react')

const SearchBox = require('./SearchBox.js')
const Globe = require('./Globe.js')

/**
 * Search page; doubles as the Datpedia homepage.
 */
module.exports = class SearchPage extends React.Component {
  render () {
    const { store, dispatch } = this.props
    const { searchIndexes } = store

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
      <div className='SearchPage'>
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

        <SearchBox searchIndexes={searchIndexes} dispatch={dispatch} autoFocus />
      </div>
    )
  }
}

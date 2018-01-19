const React = require('react')
const ReactAutocomplete = require('react-autocomplete')
const normalizeForSearch = require('normalize-for-search')
const binarySearchBounds = require('binary-search-bounds')

const { searchIndexSort } = require('./util')

/**
 * Shows a typeahead search box over a given list of items.
 * Each item must have {value, name}
 * Dispatches a 'NAVIGATE' action when the user chooses an item.
 */
module.exports = class SearchBox extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      matchedItems: []
    }
    this._onInputChangeBound = this._onInputChange.bind(this)
  }

  render () {
    const {
      autoFocus = false,
      dispatch
    } = this.props

    const {
      matchedItems,
      value
    } = this.state

    return (
      <ReactAutocomplete
        inputProps={{
          placeholder: 'search...',
          className: 'search',
          autoFocus
        }}
        menuStyle={{
          padding: '0',
          position: 'fixed',
          overflow: 'auto'
        }}
        wrapperProps={{className: 'SearchBox'}}
        items={matchedItems}
        getItemValue={item => item.name}
        renderItem={(item, highlighted) =>
          <div
            className='searchItem'
            key={item.name}
            style={{
              margin: '8px 0',
              padding: '4px 32px',
              background: '#fff',
              border: '2px solid ' + (highlighted ? '#000' : '#fff')
            }}
          >
            {item.name}
          </div>
        }
        value={value}
        onChange={this._onInputChangeBound}
        onSelect={(value, item) => {
          this.setState({ value })
          dispatch('NAVIGATE', '#' + item.urlName)
        }}
      />
    )
  }

  _onInputChange (e) {
    console.time('_onInputChange')

    const value = e.target.value
    const searchName = normalizeForSearch(value)

    // create items for binary search
    const startItem = { searchName }
    const endItem = { searchName: searchName + '~' }

    const { items } = this.props
    const matchedItems = items.slice(
      binarySearchBounds.ge(items, startItem, searchIndexSort),
      binarySearchBounds.lt(items, endItem, searchIndexSort) + 1
    )

    this.setState({ value, matchedItems })

    console.timeEnd('_onInputChange')
  }
}

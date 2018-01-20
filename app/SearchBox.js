const binarySearchBounds = require('binary-search-bounds')
const normalizeForSearch = require('normalize-for-search')
const React = require('react')
const ReactAutocomplete = require('react-autocomplete')

const { searchIndexSort } = require('./util')

const NUM_RESULTS = 5

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

    if (value === '') {
      this.setState({ value, matchedItems: [] })
      return
    }

    const partialIndexItems = this._search('partial', value)
      .slice(0, NUM_RESULTS)

    // Skip full search if we already have enough results from the partial index
    const fullIndexItems = this._search('full', value)
      .slice(0, NUM_RESULTS)
      .filter(fullItem => {
        // Dedupe, since the same result may be in the partial index
        const inPartialIndex = partialIndexItems.find(partialItem => {
          return partialItem.urlName === fullItem.urlName
        })
        return !inPartialIndex
      })

    const matchedItems = [].concat(partialIndexItems, fullIndexItems)

    this.setState({
      value,
      matchedItems: matchedItems.slice(0, NUM_RESULTS)
    })

    console.timeEnd('_onInputChange')
  }

  _search (indexName, value) {
    const { searchIndexes } = this.props

    const searchIndex = searchIndexes[indexName]
    const searchName = normalizeForSearch(value)

    // create items for binary search
    const startItem = { searchName }
    const endItem = { searchName: searchName + '~' }

    const matchedItems = searchIndex.slice(
      binarySearchBounds.ge(searchIndex, startItem, searchIndexSort),
      binarySearchBounds.lt(searchIndex, endItem, searchIndexSort) + 1
    )

    return matchedItems
  }
}

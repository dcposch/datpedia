/* @flow */

import React from 'react'
import ReactAutocomplete from 'react-autocomplete'
import { findRange } from './search.js'

import type { StoreDispatch, Article } from './types.js'

const NUM_RESULTS = 5

/**
 * Shows a typeahead search box over a given list of items.
 * Each item must have {value, name}
 * Dispatches a 'NAVIGATE' action when the user chooses an item.
 */
export default class SearchBox extends React.Component {
  props: StoreDispatch & { autoFocus?: boolean, whiteBg?: boolean }
  state: {
    matchedItems: Article[]
  }
  _onInputChangeBound: () => void
  _input: ?HTMLInputElement

  constructor (props: $PropertyType<SearchBox, 'props'>) {
    super(props)
    this.state = {
      matchedItems: []
    }
    this._onInputChangeBound = this._onInputChange.bind(this)
    this._input = null
  }

  render () {
    const { autoFocus = false, whiteBg = false, store, dispatch } = this.props

    const { search } = store

    const { matchedItems } = this.state

    const menuStyle = {
      padding: '0',
      position: 'absolute',
      overflow: 'auto',
      zIndex: 999,
      cursor: 'pointer',
      background: '',
      borderBottom: '',
      borderLeft: '',
      borderRight: ''
    }

    if (whiteBg) {
      menuStyle.background = '#fff'
      if (matchedItems.length > 0) {
        menuStyle.borderBottom = '2px solid #000'
        menuStyle.borderLeft = '2px solid #000'
        menuStyle.borderRight = '2px solid #000'
      }
    }

    return (
      <ReactAutocomplete
        ref={e => {
          this._input = e
        }}
        inputProps={{
          placeholder: 'search...',
          className: 'search',
          autoFocus
        }}
        menuStyle={menuStyle}
        wrapperProps={{ className: 'SearchBox' }}
        items={matchedItems}
        getItemValue={item => item.name}
        renderItem={(item, highlighted) => (
          <div
            className='searchItem'
            key={item.name}
            style={{
              margin: '8px 0',
              padding: '4px 32px',
              background: '#fff',
              border:
                '2px solid ' + (highlighted && !whiteBg ? '#000' : '#fff'),
              textDecoration: highlighted && whiteBg ? 'underline' : 'none'
            }}
          >
            {item.name}
          </div>
        )}
        value={search || ''}
        onChange={this._onInputChangeBound}
        onSelect={(value, item) => {
          if (this._input != null) this._input.blur()
          this.setState({ matchedItems: [] })
          dispatch('NAVIGATE', '#' + item.urlName)
        }}
      />
    )
  }

  _onInputChange () {
    console.time('_onInputChange')

    const { dispatch } = this.props

    const target = this._input
    if (target == null) return
    const value = target.value
    dispatch('SET_SEARCH', value === '' ? null : value)

    if (value === '') {
      this.setState({ matchedItems: [] })
      return
    }

    const partialIndexItems = this._search('partial', value).slice(
      0,
      NUM_RESULTS
    )

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
      matchedItems: matchedItems.slice(0, NUM_RESULTS)
    })

    console.timeEnd('_onInputChange')
  }

  _search (indexName: string, value: string) {
    const { store } = this.props
    const { searchIndexes } = store
    const searchIndex = searchIndexes[indexName]
    return findRange(searchIndex, value)
  }
}

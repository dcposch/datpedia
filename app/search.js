const React = require('react')
const ReactAutocomplete = require('react-autocomplete')
const normalizeForSearch = require('normalize-for-search')

module.exports = class Search extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
  }

  render () {
    const {
      items = [],
      onSelect = () => {}
    } = this.props

    return (
      <ReactAutocomplete
        inputProps={{
          placeholder: 'search...',
          className: 'search',
          autoFocus: true
        }}
        menuStyle={{
          padding: '0',
          position: 'fixed',
          overflow: 'auto'
        }}
        wrapperStyle={{
          display: 'block'
        }}
        items={items}
        shouldItemRender={(item, value) =>
          value.length !== 0 && item.searchName.indexOf(value) > -1
        }
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
        value={normalizeForSearch(this.state.value)}
        onChange={e => this._onInputChange(e)}
        onSelect={(value, item) => {
          this.setState({ value })
          onSelect(item)
        }}
      />
    )
  }

  _onInputChange (e) {
    this.setState({ value: e.target.value })
  }
}

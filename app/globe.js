const React = require('react')

module.exports = class Globe extends React.Component {
  constructor (props) {
    super(props)

    this._svg = null
    this._onResizeBound = () => this.onResize()
    this._frameBound = () => this.frame()

    const nlat = 17
    const nlon = 36

    this._theta = 0
    this._points = new Float32Array(nlat * nlon * 3)
    for (let i = 0; i < nlat; i++) {
      for (let j = 0; j < nlon; j++) {
        const plat = ((i - ((nlat - 1) / 2)) / (nlat + 1)) * Math.PI
        const plon = (j / nlon) * 2 * Math.PI

        // x y z
        this._points[3 * (i * nlat + j) + 0] = Math.cos(plon) * Math.cos(plat)
        this._points[3 * (i * nlat + j) + 1] = Math.sin(plon) * Math.cos(plat)
        this._points[3 * (i * nlat + j) + 2] = Math.sin(plat)
      }
    }

    this.state = {width: window.innerWidth, height: window.innerHeight}
  }

  onResize () {
    this.setState({width: window.innerWidth, height: window.innerHeight})
  }

  componentDidMount () {
    window.addEventListener('resize', this._onResizeBound)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._onResizeBound)
  }

  render () {
    const {width, height} = this.state
    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    }
    return (
      <svg
        ref={e => this.initSvg(e)}
        width={width}
        height={height}
        style={style}
      />
    )
  }

  initSvg (svg) {
    this._svg = svg

    // TODO: add lines
    svg.createElement('line')
  }

  frame () {
    if (this._svg == null) {
      return
    }
    window.requestAnimationFrame(this._frameBound)
  }
}

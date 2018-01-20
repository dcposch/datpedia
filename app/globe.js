const React = require('react')

module.exports = class Globe extends React.Component {
  constructor (props) {
    super(props)

    this._svg = null
    this._svgLines = []
    this._onResizeBound = () => this.onResize()
    this._frameBound = () => this.frame()

    const nlat = this._nlat = 17
    const nlon = this._nlon = 36

    this._theta = 0
    this._points = new Float32Array(nlat * nlon * 3)
    for (let i = 0; i < nlat; i++) {
      for (let j = 0; j < nlon; j++) {
        const plat = ((i - ((nlat - 1) / 2)) / (nlat + 1)) * Math.PI
        const plon = (j / nlon) * 2 * Math.PI

        // x y z
        this._points[3 * (i * nlon + j) + 0] = Math.cos(plon) * Math.cos(plat)
        this._points[3 * (i * nlon + j) + 1] = Math.sin(plon) * Math.cos(plat)
        this._points[3 * (i * nlon + j) + 2] = Math.sin(plat)
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
    this._svg = null
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
    if (this._svg != null) throw new Error('double init')

    this._svg = svg

    const nla = this._nlat
    const nlo = this._nlon

    for (let i = 0; i < nla; i++) {
      for (let j = 0; j < nlo; j++) {
        const lines = []
        for (let k = 0; k < 1 + (i < nla - 1 ? 1 : 0); k++) {
          const li = svg.createElement('line')
          svg.appendChild(li)
          lines.push(li)
        }
        this._svgLines[i * nlo + j] = lines
      }
    }
  }

  frame () {
    if (this._svg == null) {
      return
    }

    const nla = this._nlat
    const nlo = this._nlon

    for (let i = 0; i < nla; i++) {
      for (let j = 0; j < nlo; j++) {
        const p00 = this.getPoint(i, j)
        const p01 = this.getPoint(i, (j + 1) % nlo)
        const lines = this._lines[i * nlo + j]
        setLine(lines[0], p00, p01)

        if (i < nla - 1) {
          const p10 = this.getPoint(i + 1, j)
          setLine(lines[1], p00, p10)
        }
      }
    }

    window.requestAnimationFrame(this._frameBound)
  }

  getPoint (i, j) {
    const ix = (i * this._nlon + j) * 3
    return this._points.slice(ix, ix + 3)
  }
}

function setLine (line, pA, pB) {
  // TODO: projection matrix

  line.x0 = pA[0] * 200 + 400
  line.x1 = pA[1] * 200 + 400
  line.x0 = pB[0] * 200 + 400
  line.x1 = pB[1] * 200 + 400
}

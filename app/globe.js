/* @flow */

import React from 'react'
import { mat4, vec4, vec3 } from 'gl-matrix'

export default class Globe extends React.Component {
  state: {
    width: number,
    height: number
  }

  _svg: ?HTMLElement
  _svgLines: Element[][]
  _onResizeBound: () => void
  _frameBound: () => void
  _nlat: number
  _nlon: number
  _theta: number
  _points: Float32Array

  constructor () {
    super({})

    this._svg = null
    this._svgLines = []
    this._onResizeBound = () => this.onResize()
    this._frameBound = () => this.frame()

    const nlat = (this._nlat = 5)
    const nlon = (this._nlon = 8)

    this._theta = 0
    this._points = new Float32Array(nlat * nlon * 3)
    for (let i = 0; i < nlat; i++) {
      for (let j = 0; j < nlon; j++) {
        const plat = (i - (nlat - 1) / 2) / (nlat + 1) * Math.PI
        const plon = j / nlon * 2 * Math.PI

        // x y z
        this._points[3 * (i * nlon + j) + 0] = Math.cos(plon) * Math.cos(plat)
        this._points[3 * (i * nlon + j) + 1] = Math.sin(plon) * Math.cos(plat)
        this._points[3 * (i * nlon + j) + 2] = Math.sin(plat)
      }
    }

    this.state = { width: window.innerWidth, height: window.innerHeight }
  }

  onResize () {
    this.setState({ width: window.innerWidth, height: window.innerHeight })
  }

  componentDidMount () {
    window.addEventListener('resize', this._onResizeBound)
  }

  componentWillUnmount () {
    this._svg = null
    window.removeEventListener('resize', this._onResizeBound)
  }

  render () {
    const { width, height } = this.state
    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: -1
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

  initSvg (svg: HTMLElement) {
    if (this._svg != null) throw new Error('double init')

    this._svg = svg

    const nla = this._nlat
    const nlo = this._nlon

    const xmlns = 'http://www.w3.org/2000/svg'
    for (let i = 0; i < nla; i++) {
      for (let j = 0; j < nlo; j++) {
        const lines = []
        for (let k = 0; k < 1 + (i < nla - 1 ? 1 : 0); k++) {
          const line = document.createElementNS(xmlns, 'line')

          line.setAttribute('stroke', 'black')
          line.setAttribute('stroke-width', '1.5')

          svg.appendChild(line)
          lines.push(line)
        }
        this._svgLines[i * nlo + j] = lines
      }
    }

    this.frame()
  }

  frame () {
    if (this._svg == null) {
      return
    }

    // COMPUTE frame
    const { width, height } = this.state
    const w2 = width / 2
    const h2 = height / 2
    const m = 0.8 * Math.min(w2, h2)

    // COMPUTE CAMERA
    const mat = mat4.create()
    const t = window.performance.now() / 1000
    const center = vec3.create()
    const eye = vec3.fromValues(
      2 * Math.cos(t / 3),
      2 * Math.sin(t / 3),
      0.1 * Math.sin(t / Math.PI)
    )
    const up = vec3.create()
    vec3.cross(up, eye, vec3.fromValues(0, 0, 1))
    vec3.normalize(up, up)
    mat4.lookAt(mat, eye, center, up)

    // DRAW LINES
    const nla = this._nlat
    const nlo = this._nlon
    for (let i = 0; i < nla; i++) {
      for (let j = 0; j < nlo; j++) {
        const p00 = this.getPoint(i, j)
        const p01 = this.getPoint(i, (j + 1) % nlo)
        const lines = this._svgLines[i * nlo + j]
        setLine(lines[0], p00, p01, mat, m, w2, h2)

        if (i < nla - 1) {
          const p10 = this.getPoint(i + 1, j)
          setLine(lines[1], p00, p10, mat, m, w2, h2)
        }
      }
    }

    window.requestAnimationFrame(this._frameBound)
  }

  getPoint (i: number, j: number) {
    const ix = (i * this._nlon + j) * 3
    return this._points.slice(ix, ix + 3)
  }
}

function setLine (line, pA, pB, mat, m, w2, h2) {
  // TODO: projection matrix

  const a = vec4.fromValues(pA[0], pA[1], pA[2], 1)
  const b = vec4.fromValues(pB[0], pB[1], pB[2], 1)

  vec4.transformMat4(a, a, mat)
  vec4.transformMat4(b, b, mat)

  if (a[3] !== 1 || b[3] !== 1) {
    if (Math.random() < 0.001) {
      console.log('div != 1')
    }
  }

  line.setAttribute('x1', '' + (a[0] / a[3] * m + w2))
  line.setAttribute('y1', '' + (a[1] / a[3] * m + w2))
  line.setAttribute('x2', '' + (b[0] / b[3] * m + h2))
  line.setAttribute('y2', '' + (b[1] / b[3] * m + h2))
}

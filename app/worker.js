/* global fetch */

import { Comlink } from 'comlinkjs'

export default function (self) {
  async function fetchSearchIndex (url) {
    const res = await fetch(url)
    if (res.status !== 200) {
      throw new Error('Non-200 status code ' + res.status)
    }

    const searchIndex = await res.json()
    return searchIndex
  }

  Comlink.expose({ fetchSearchIndex }, self)
}

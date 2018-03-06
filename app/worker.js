/* @flow */

import { Comlink } from 'comlinkjs'

export default function (self: any) {
  async function fetchIndex (url) {
    console.log('fetching search index ' + url)
    const res = await self.fetch(url)
    if (res.status !== 200) {
      throw new Error('Non-200 status code ' + res.status)
    }
    return res
  }

  async function fetchPartialIndex (url) {
    const res = await fetchIndex(url)
    const partialIndex = await res.json()
    return partialIndex
  }

  Comlink.expose({
    fetchPartialIndex
  }, self)
}

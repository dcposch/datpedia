/* @flow */

import normalizeForSearch from 'normalize-for-search'
import binarySearchBounds from 'binary-search-bounds'

import { searchIndexSort } from './util.js'

import type { Article } from './types.js'

module.exports = { findItem, findRange }

function findItem (searchIndex: Article[], name: string) {
  const searchName = normalizeForSearch(name)
  const ix = binarySearchBounds.eq(searchIndex, { searchName }, searchIndexSort)
  return ix < 0 ? null : searchIndex[ix]
}

function findRange (searchIndex: Article[], prefix: string) {
  const searchPrefix = normalizeForSearch(prefix)

  // create items for binary search
  const startItem = { searchName: searchPrefix }
  const endItem = { searchName: searchPrefix + String.fromCharCode(0xffff) }

  const matchedItems = searchIndex.slice(
    binarySearchBounds.ge(searchIndex, startItem, searchIndexSort),
    binarySearchBounds.lt(searchIndex, endItem, searchIndexSort) + 1
  )

  return matchedItems
}

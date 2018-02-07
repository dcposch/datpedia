/* @flow */

import type { Article } from './types.js'

/*
 * Sort `searchIndex` items with shape { name, searchName, urlName }
 * alphabetically by the `searchName` property.
 */
export function searchIndexSort (item1: Article, item2: Article): number {
  const name1 = item1.searchName
  const name2 = item2.searchName

  if (name1 === name2) return 0

  return name1 < name2 ? -1 : 1
}

export function urlNameToName (urlName: string): string {
  let name = urlName.replace(/_/g, ' ')
  try {
    name = decodeURIComponent(name)
  } catch (_) {}
  return name
}

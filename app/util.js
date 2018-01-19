/*
 * Sort `searchIndex` items with shape { name, searchName, urlName }
 * alphabetically by the `searchName` property.
 */
exports.searchIndexSort = (item1, item2) => {
  const name1 = item1.searchName
  const name2 = item2.searchName

  if (name1 === name2) return 0

  return name1 < name2
    ? -1
    : 1
}

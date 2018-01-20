/* global fetch */

const { Comlink } = require('comlinkjs')
const normalizeForSearch = require('normalize-for-search')

module.exports = function (self) {
  async function fetchSearchIndex (url) {
    const res = await fetch(url)
    if (res.status !== 200) {
      console.error('Error fetching list.txt', res)
      return
    }

    const articlesStr = await res.text()

    let articles = articlesStr
      .split('\n')
      .slice(0, -1) // remove extra empty item caused by trailing \n

    const searchIndex = articles
      .map(urlName => {
        const name = urlName.replace(/_/g, ' ')
        const searchName = normalizeForSearch(name)
        return {
          urlName,
          name,
          searchName
        }
      })

    return searchIndex
  }

  Comlink.expose({
    fetchSearchIndex
  }, self)
}

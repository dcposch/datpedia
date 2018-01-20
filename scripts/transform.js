#!/usr/bin/env node

const fs = require('fs')
const mkdirpSync = require('mkdirp').sync
const dataUriSync = require('datauri').sync
const normForSearch = require('normalize-for-search')

const {rewriteImageUrls} = require('./relinker.js')
const {searchIndexSort, urlNameToName} = require('../app/util.js')

if (process.argv.length !== 3) {
  console.log('Usage: ./scripts/transform.js <name>')
  process.exit()
}

main(process.argv[2])

function main (name) {
  const dst = 'transform/' + name
  const dstA = dst + '/A'
  mkdirpSync(dstA)

  console.log('listing articles')

  const articles = fs.readdirSync('extract/' + name + '/A/')
    .filter(s => s.endsWith('.html'))
    .map(s => s.substring(0, s.length - '.html'.length))

  articles.forEach(article => transferArticle(name, article, dstA))

  console.log('creating list-all.json')

  const topArticles = fs.readFileSync('most-viewed/list.txt', 'utf8')
    .split(/\n/g).filter(s => s.length > 0)
  writeSortedArticleJson(topArticles, 'list-partial.json')
  writeSortedArticleJson(articles, 'list-full.json')
}

function writeSortedArticleJson (articles, filename) {
  const index = articles.map(a => {
    const urlName = a
    const name = urlNameToName(urlName)
    const searchName = normForSearch(name)
    return {urlName, name, searchName}
  })

  index.sort(searchIndexSort)

  fs.writeFileSync(dst + '/' + filename, JSON.stringify(index))
}

function transferArticle (dumpName, name, dst) {
  const filename = 'extract/' + dumpName + '/A/' + name + '.html'

  if (!fs.existsSync(filename)) {
    console.log('not found, skipping: ' + filename)
    return
  }

  console.log('transferring %s', name)

  const html = fs.readFileSync(filename, 'utf8')
  const newHtml = transformHtml(html)
  fs.writeFileSync(dst + '/' + name + '.html', newHtml)
}

function transformHtml (html) {
  const lines = html.split(/\n/g).map(s => s.trim())

  let foundStylesheet = false
  const newLines = lines
    .filter(line => !line.includes('<script'))
    .map(line => {
      if (line.startsWith('<link rel="stylesheet"')) {
        if (foundStylesheet) {
          console.error('found two stylesheets, ignoring second')
          return ''
        }
        foundStylesheet = true
        return '<link rel="stylesheet" href="./style.css">'
      } else if (line.startsWith('<body ')) {
        return '<body class="mw-body mw-body-content mediawiki">'
      } else {
        return line
      }

      line = rewriteImageUrls(line, transformImageUrl)
    })

  return newLines.join('\n')
}

// Transforms image urls to data:// URIs
function transformImageUrl (url) {
  if (!url.startsWith('../I/m')) return url

  const imagePath = decodeURIComponent(url.substring(3))
  const dataURI = dataUriSync(imagePath)
  return dataURI
}

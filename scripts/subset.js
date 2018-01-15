#!/usr/bin/env node

const fs = require('fs')
const mkdirp = require('mkdirp')
const {getImageUrls} = require('./relinker.js')

if (process.argv.length !== 4) {
  console.log('Usage: ./scripts/subset.js <wiki dump name> <filename, plain text list of article names>')
  process.exit()
}

main(process.argv[2], process.argv[3])

function main (dumpName, articlesFile) {
  const articles = fs.readFileSync(articlesFile, 'utf8').trim().split('\n')

  mkdirp('subset/A')
  mkdirp('subset/I/m')

  articles.forEach(name => transferArticle(dumpName, name))
}

function transferArticle (dumpName, name) {
  const filename = dumpName + '/' + name + '.html'

  if (!fs.exists(filename)) {
    console.log('Not found, skipping: ' + filename)
    return
  }

  const html = fs.readFileSync(filename, 'utf8')
  const imageUrls = getImageUrls(html)

  console.log('Transferring %s with %d images', name, imageUrls.length)

  fs.copyFileSync(filename, 'subset/A/' + name + '.html')

  imageUrls.filter(url => url.startsWith('../I/m')).map(url => {
    const src = dumpName + '/' + url.substring(3)
    const dst = 'subset/' + url.substring(3)
    try {
    fs.copyFileSync(src, dst)
  } catch (e) {
    console.log('Failed to copy %s: %s', url, e.message)
  }
  })
}

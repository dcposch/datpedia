#!/usr/bin/env node

const fs = require('fs')
const mkdirpSync = require('mkdirp').sync
const path = require('path')

if (process.argv.length !== 4) {
  console.error(
    'Usage: ./scripts/organize.js <source, from extract_zim> ' +
      '<dest, empty dir to fill w static HTMLs>'
  )
  process.exit(1)
}

main(process.argv[2], process.argv[3])

function main (src, dst) {
  const entries = fs.readdirSync(src)

  if (entries.join(',') !== '-,A,I,M') {
    console.error(
      'Unexpected source directory. Expected -, A, I, M. Found %s',
      entries.join(', ')
    )
  }

  const articles = fs.readdirSync(src + '/A').filter(a => a.endsWith('.html'))
  console.log('found %d articles...', articles.length)

  const searchIndexPath = path.join(dst, 'search.json')
  console.log('Writing search index ' + searchIndexPath)
  fs.writeFileSync(
    searchIndexPath,
    JSON.stringify(articles, undefined, 2)
  )
}

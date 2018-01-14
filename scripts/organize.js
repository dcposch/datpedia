#!/usr/bin/env node

const fs = require('fs')
const mkdirpSync = require('mkdirp').sync

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
  splitFiles(articles, src + '/A', dst, transformArticle)

  const images = fs.readdirSync(src + '/I/m')
  console.log('found %d images...', images.length)
  splitFiles(images, src + '/I/m', dst + '/img')
}

function splitFiles (files, src, dst, transformer) {
  const filesByFolder = {}
  files.forEach(f => {
    const folder = getFolder(f)
    filesByFolder[folder] = filesByFolder[folder] || []
    filesByFolder[folder].push(f)
  })

  Object.keys(filesByFolder).forEach(folder => {
    const ffs = filesByFolder[folder]
    console.log('Creating %s, copying %d files...', folder, ffs.length)

    // TODO
    const dfolder = dst + '/' + folder
    mkdirpSync(dfolder)
    ffs.forEach(f => fs.copyFileSync(src + '/' + f, dfolder + '/' + f))
  })
}

function getFolder (file) {
  const name = file.substring(0, file.lastIndexOf('.'))

  const parts = [name[0]]
  if (name.length > 1) parts.push(name[1])
  if (name.length > 2) parts.push(name[2])
  if (name.length > 3) parts.push(name.substr(3, Math.min(10, name.length)))

  return parts.join('/')
}

function transformArticle () {
  // TODO
}

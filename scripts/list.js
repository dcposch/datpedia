#!/usr/bin/env node

const { searchIndexSort, urlNameToName } = require('../lib/util.js')
const { readEntries } = require('../lib/unzip.js')

const fs = require('fs')
const pify = require('pify')
const yauzl = require('yauzl')
const normForSearch = require('normalize-for-search')

if (process.argv.length !== 3) {
  console.log('Usage: ./scripts/list.js <name>')
  process.exit()
}

const yauzlOpen = pify(yauzl.open.bind(yauzl))

main(process.argv[2])

async function main (name) {
  const dir = 'transform/' + name

  console.log('loading wiki.zip')
  const articles = await loadArticles(dir + '/wiki.zip')
  articles.sort(searchIndexSort)

  console.log('creating list.tsv')
  writeTsv(dir + '/list.tsv', articles)

  console.log('creating list-partial.json')
  const topArticleNames = fs
    .readFileSync('most-viewed/list.txt', 'utf8')
    .split(/\n/g)
    .filter(s => s.length > 0)
  const topArticles = articles.filter(a => topArticleNames.includes(a.urlName))
  writeJsonArray(dir + '/list-partial.json', topArticles)
}

function writeTsv (path, items) {
  const stream = fs.createWriteStream(path)
  const cols = [
    'name',
    'searchName',
    'compressedSize',
    'relativeOffsetOfLocalHeader',
    'compressionMethod',
    'generalPurposeBitFlag'
  ]
  stream.write(cols.join('\t') + '\n', 'utf8')
  for (let i = 0; i < items.length; i++) {
    const vals = cols.map(c => items[i][c])
    stream.write(vals.join('\t') + '\n', 'utf8')
    if ((i + 1) % 100000 === 0) {
      console.log(`wrote ${i + 1} lines`)
    }
  }
  stream.end()
}

function writeJsonArray (path, items) {
  const stream = fs.createWriteStream(path)
  stream.write('[\n', 'utf8')
  for (let i = 0; i < items.length; i++) {
    const line = JSON.stringify(items[i]) + (i < items.length - 1 ? ',' : '')
    stream.write(line + '\n', 'utf8')
    if ((i + 1) % 100000 === 0) {
      console.log(`wrote ${i + 1} lines`)
    }
  }
  stream.write(']\n', 'utf8')
  stream.end()
}

async function loadArticles (path) {
  const zipfile = await yauzlOpen(path, { lazyEntries: true })
  console.log('opened ' + path)
  const articles = await readEntries(zipfile, entryToArticle)
  return articles
}

function entryToArticle (entry) {
  const {
    fileName,
    compressedSize,
    relativeOffsetOfLocalHeader,
    compressionMethod,
    generalPurposeBitFlag
  } = entry

  if (!fileName.startsWith('A/') || !fileName.endsWith('.html')) {
    throw new Error('unexpected filename ' + fileName)
  }

  const urlName = fileName.substring(
    'A/'.length,
    fileName.length - '.html'.length
  )
  const name = urlNameToName(urlName)
  const searchName = normForSearch(name)

  return {
    urlName,
    name,
    searchName,
    compressedSize,
    relativeOffsetOfLocalHeader,
    compressionMethod,
    generalPurposeBitFlag
  }
}

#!/usr/bin/env node

const fs = require('fs')
const mkdirpSync = require('mkdirp').sync
const dataUriSync = require('datauri').sync

const {rewriteImageUrls, rewriteLinks} = require('./relinker.js')

if (![3, 4].includes(process.argv.length)) {
  console.log('Usage: ./scripts/transform.js <name> <opt prefix>')
  process.exit()
}

main(process.argv[2], process.argv[3])

function main (name, optPrefix) {
  const dst = 'transform/' + name
  const dstA = dst + '/A'
  mkdirpSync(dstA)

  console.log('listing articles')

  let articles = fs.readdirSync('extract/' + name + '/A/')
    .filter(s => s.endsWith('.html'))
    .map(s => s.substring(0, s.length - '.html'.length))

  if (optPrefix != null) {
    articles = articles.filter(a => a.startsWith(optPrefix))
  }

  const ix = articles.indexOf('Sparklehorse')
  console.log('found Sparklehorse at ' + ix)
  articles = articles.slice(ix)

  articles.forEach(article => transferArticle(name, article, dstA))
}

function transferArticle (dumpName, name, dst) {
  const filename = 'extract/' + dumpName + '/A/' + name + '.html'

  if (!fs.existsSync(filename)) {
    console.log('not found, skipping: ' + filename)
    return
  }

  console.log('transferring %s', name)

  const html = fs.readFileSync(filename, 'utf8')
  const newHtml = transformHtml(html, dumpName, name)
  fs.writeFileSync(dst + '/' + name + '.html', newHtml)
}

function transformHtml (html, dumpName, pageUrlName) {
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
    })

  let newHtml = newLines.join('\n')
  newHtml = rewriteImageUrls(newHtml, url => transformImageUrl(url, dumpName))
  newHtml = rewriteLinks(newHtml, url => transformLink(url, pageUrlName))
  return newHtml
}

// Transforms image urls to data:// URIs
function transformImageUrl (url, dumpName) {
  if (!url.startsWith('../I/m')) return url

  const imageFileName = decodeURIComponent(url.substring(3))
  const path = 'extract/' + dumpName + '/' + imageFileName
  let dataURI
  try {
    dataURI = dataUriSync(path)
  } catch (e) {
    console.log('failed to turn image into data URI', path, e)
    dataURI = 'data:image/gif;base64,' +
     'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  }
  return dataURI
}

function transformLink (url, pageUrlName) {
  // Leave external links alone
  if (url === '' || url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('geo:')) {
    return 'https://www.google.com/maps?t=k&q=loc:' + url.substr('geo:'.length)
  }
  if (url.startsWith('#')) {
    // Cite notes, etc. Rewrite "#cite_note-1" to '#Hypertext#cite_note-1'
    return '#' + pageUrlName + url
  }
  if (url.includes('.html#')) {
    // Turn eg "Foo.html#bar" into "#Foo#bar"
    const ix = url.indexOf('.html#')
    return '#' + url.substring(0, ix) + url.substring(ix + '.html'.length)
  }
  if (url.includes('#')) {
    // Turn "Foo#bar" into "#Foo#bar"
    return '#' + url
  }
  if (!url.endsWith('.html')) {
    console.log('skipping non-standard link: ' + url)
    return url
  }
  // Wiki links. Rewrite 'Anarchism.html' to '#Anarchism'
  return '#' + url.substring(0, url.length - '.html'.length)
}

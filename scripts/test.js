const fs = require('fs')
const {getLinks} = require('./relinker.js')

const filename = './extract/wikipedia_en_ray_charles_2015-06/A/Ray_Charles.html'
const html = fs.readFileSync(filename, 'utf8')
const urls = getLinks(html)

console.log(urls.join('\n'))

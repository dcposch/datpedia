
const wikiDatAddr = 'dat://42d11736f14d728eddc10aa0633904ac48faeaa621511791b362e77431645587/wikipedia_en_simple_all_2017-01.zim'


const headers = new Headers({
  'Range': 'bytes=0-1023'
})

console.log('Fetching...')
fetch(wikiDatAddr, { headers })
  .then(res => console.log(res))
  .catch(err => console.error(err))



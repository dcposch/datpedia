
const wikiDatAddr = '/wikipedia_en_simple_all_2017-01.zim'


const headers = new Headers({
  'Range': 'bytes=0-1023'
})

console.log('Fetching...')
const root = document.querySelector('#root')
fetch(wikiDatAddr, { headers })
  .then(res => root.innerText = 'it worked! range request result: ' + res.blob())
  .catch(err => console.error(err))



main()

async function main () {
  const wikiDatAddr = '/wikipedia_en_simple_all_2017-01.zim'

  const headers = new window.Headers({
    'Range': 'bytes=0-1023'
  })

  console.log('Fetching...')
  const root = document.querySelector('#root')

  const res = await window.fetch(wikiDatAddr, { headers })
  if (res.ok) {
    const buf = await res.arrayBuffer()
    root.innerText = 'it worked! range request result: ' + buf2hex(buf)
  } else {
    root.innerText = 'range request failed: ' + res.status
  }
}

function byte2hex (x) {
  return ('00' + x.toString(16)).slice(-2)
}

function buf2hex (buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), byte2hex).join(' ')
}

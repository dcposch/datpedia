
function getLinks (html) {
  const re = /<a[^>]* href="([^"]*)"/gm
  return getGroup1(html, re)
}

function getImageUrls (html) {
  const re = /<img[^>]* src="([^"]*)"/gm
  return getGroup1(html, re)
}

function rewriteImageUrls (html, func) {
  const re = /<img([^>]*) src="([^"]*)"/gm

  const ret = []
  let lastIndex = 0
  let m
  while ((m = re.exec(html)) != null) {
    ret.push(html.substring(lastIndex, re.lastIndex - m[0].length))
    ret.push('<img')
    ret.push(m[1])
    ret.push(' src="')
    ret.push(func(m[2]))
    ret.push('"')
    lastIndex = re.lastIndex
  }
  ret.push(html.substring(lastIndex))

  return ret.join('')
}

function rewriteLinks (html, func) {
  const re = /<a([^>]*) href="([^"]*)"/gm

  const ret = []
  let lastIndex = 0
  let m
  while ((m = re.exec(html)) != null) {
    ret.push(html.substring(lastIndex, re.lastIndex - m[0].length))
    ret.push('<a')
    ret.push(m[1])
    ret.push(' href="')
    ret.push(func(m[2]))
    ret.push('"')
    lastIndex = re.lastIndex
  }
  ret.push(html.substring(lastIndex))

  return ret.join('')
}

function getGroup1 (text, re) {
  const ret = []
  let m
  while ((m = re.exec(text)) != null) {
    const url = m[1]
    ret.push(url)
  }
  return ret
}

module.exports = { getLinks, getImageUrls, rewriteImageUrls, rewriteLinks }

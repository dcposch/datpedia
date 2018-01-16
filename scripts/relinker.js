
function getLinks (html) {
  const re = /<a[^>]* href="([^"]*)"/g
  return getGroup1(html, re)
}

function getImageUrls (html) {
  const re = /<img[^>]* src="([^"]*)"/g
  return getGroup1(html, re)
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

module.exports = { getLinks, getImageUrls }

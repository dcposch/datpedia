Array.prototype.slice.apply(document.querySelectorAll('a'))
  .map(a => a.href)
  .filter(url => url.startsWith('https://en.wikipedia.org/wiki'))
  .map(url => url.substring('https://en.wikipedia.org/wiki/'.length))
  .filter(n => !n.startsWith('Wikipedia') && !n.startsWith('Special:') && !n.startsWith('Help:') && !n.startsWith('Portal:') && !n.startsWith('Category:') && !n.startsWith('User:') && n !== '-' && !n.endsWith('.php'))
  .join('\n')

https://en.wikipedia.org/wiki/Wikipedia:Multiyear_ranking_of_most_viewed_pages

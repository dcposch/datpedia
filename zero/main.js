/* global Headers, fetch */

main()

async function main () {
  registerServiceWorker()

  const headers = new Headers({
    // 'Range': 'bytes=0-1023'
  })

  const res = await fetch('/index.js', { headers })
  if (res.ok) {
    const text = await res.text()
    console.log('it worked')
    console.log(text)
  } else {
    console.error('range request failed: ' + res.status)
  }
}

async function registerServiceWorker () {
  if (!navigator.serviceWorker) throw new Error('No service worker support')
  return navigator.serviceWorker.register(
    '/sw-bundle.js',
    { scope: '/' }
  )
}

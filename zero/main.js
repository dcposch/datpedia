/* global fetch */

main()

async function main () {
  registerServiceWorker()

  const res = await fetch('/index.js')
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

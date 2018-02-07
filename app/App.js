import React from 'react'
import SearchPage from './SearchPage.js'
import ArticlePage from './ArticlePage.js'

import type StoreDispatch from './types.js'

export default function App (props: StoreDispatch) {
  const { store, dispatch } = props
  const { urlName } = store
  console.log('rendering', urlName || 'search page')

  if (urlName != null) {
    return <ArticlePage store={store} dispatch={dispatch} />
  } else {
    return <SearchPage store={store} dispatch={dispatch} />
  }
}

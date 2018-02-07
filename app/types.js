export type Article = {
  urlName: string,
  name: string,
  searchName: string,
  compressedSize: number,
  relativeOffsetOfLocalHeader: number,
  compressedMethod: number,
  generalPurposeBitFlag: number
}

export type Store = {
  urlName: ?string,
  citeNote: ?string,
  searchIndexes: {
    partial: Article[],
    full: Article[],
    partialPromise: ?Promise<Article[]>,
    fullPromise: ?Promise<Article[]>
  },
  articleCache: { [string]: string },
  search: ?string
}

export type DispatchFunc =(string, any) => void

export type StoreDispatch = {
  store: Store,
  dispatch: DispatchFunc
}

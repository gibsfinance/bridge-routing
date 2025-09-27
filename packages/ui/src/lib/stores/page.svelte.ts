type PageState = {
  path: string
  changing: boolean
  params: URLSearchParams | null
}

const hash = location.hash.slice(1) || '/'
const [firstPath, firstParams] = hash.split('?')
export class Page {
  constructor() {
    const boundHandleHashChange = this.handleHashChange.bind(this)
    window.addEventListener('hashchange', boundHandleHashChange)
    window.addEventListener('popstate', boundHandleHashChange)
    window.addEventListener('load', boundHandleHashChange)
    this.handleHashChange() // initial load
  }
  public val = $state<PageState>({
    path: firstPath,
    changing: false,
    params: new URLSearchParams(firstParams),
  })
  get value() {
    return `${this.val.path}${this.val.params?.size ? `?${this.val.params.toString()}` : ''}`
  }
  get queryParams() {
    return this.val.params ?? new URLSearchParams()
  }
  setParam(key: string, value: string | null) {
    const params = new URLSearchParams(this.val.params ?? '')
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    this.pushState(this.val.path, params)
  }
  setParams(params: Record<string, string | null>) {
    const newParams = new URLSearchParams(this.val.params ?? '')
    for (const [key, value] of Object.entries(params)) {
      this.setParam(key, value)
    }
    this.pushState(this.val.path, newParams)
  }
  finishChange() {
    this.val.changing = false
  }
  pushState(noQuery: string, query?: URLSearchParams | null) {
    const qs = query ?? new URLSearchParams()
    const r = `${noQuery}${qs.size ? `?${qs.toString()}` : ''}`
    if (r.split('?').length > 2) {
      console.error('invalid url', r)
      throw new Error(`invalid url: ${r}`)
    }
    if (r !== this.value) {
      this.val.changing = true
      this.val = {
        path: noQuery,
        changing: true,
        params: qs,
      }
      history.pushState(null, '', `#${r}`)
      this.finishChange()
    }
  }
  url = $derived.by(() => {
    const { pathname, origin } = window.location
    return new URL(`${origin}${pathname}#${this.value}`)
  })
  params = $derived.by(() => {
    const [page, provider, fromChain, toChain, assetInAddress] = this.val.path.split('/').slice(1)
    if (provider && fromChain && toChain && assetInAddress) {
      return {
        page,
        provider,
        fromChain,
        toChain,
        assetInAddress,
      }
    }
    return {
      page,
    }
  })
  route = $derived.by(() => {
    return {
      id: this.val.path,
    }
  })
  to = $derived.by(() => {
    return this.val.changing ? this.value : null
  })
  async goto(path: string) {
    if (!path.startsWith('#')) {
      throw new Error('path must start with #')
    }
    const p = path.slice(1)
    if (!p.startsWith('/')) {
      throw new Error('second character must be /')
    }
    if (p === this.value) {
      return
    }
    this.pushState(p)
  }
  async handleHashChange() {
    if (this.val.changing) {
      return
    }
    const current = location.hash.slice(1) || '/'
    if (current !== this.value) {
      const [noQuery, query] = current.split('?')
      this.pushState(noQuery, new URLSearchParams(query))
    }
  }
}

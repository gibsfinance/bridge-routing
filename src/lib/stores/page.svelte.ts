type PageState = {
  path: string
  changing: boolean
  params: URLSearchParams | null
}

const embedModes = new Set(['simple', 'embed'])

const hash = location.hash.slice(1) || '/'
const [firstPath, firstParams] = hash.split('?')
export class Page {
  public val = $state<PageState>({
    path: firstPath,
    changing: false,
    params: new URLSearchParams(firstParams),
  })
  public locked = $state(false)
  get value() {
    return `${this.val.path}${this.val.params?.size ? `?${this.val.params.toString()}` : ''}`
  }
  get changing() {
    return this.val.changing
  }
  get mode() {
    return this.val.params?.get('mode') ?? null
  }
  get embed() {
    return embedModes.has(this.val.params?.get('mode') ?? '')
  }
  get onramps() {
    return this.val.params?.get('onramps')
  }
  get guide() {
    return this.val.params?.get('guide')
  }
  get stage() {
    return this.val.params?.get('stage')
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
    this.val.params = params
  }
  finishChange() {
    this.val.changing = false
  }
  set value(raw: string) {
    const [noQuery, query] = raw.split('?')
    const entries = [...(this.val.params ?? new Map()).entries()]
    const parsed = (new URLSearchParams(query)).entries()
    const joined = new Map([...parsed, ...entries]) // updates are first to show up in get method
    const qs = new URLSearchParams([...joined.entries()])
    const r = `${raw}${qs.size ? `?${qs.toString()}` : ''}`
    if (r.split('?').length > 2) {
      console.error('invalid url', r)
      throw new Error(`invalid url: ${r}`)
    }
    if (r !== this.value) {
      this.val.changing = true
      if (!this.locked) {
        history.pushState(null, '', `#${r}`)
      }
      this.val = {
        path: noQuery,
        changing: true,
        params: qs,
      }
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
}
export const page = new Page()

export class Navigating {
  to = $derived.by(() => {
    return page.changing ? page.value : null
  })
}

export const navigating = new Navigating()

export const goto = async (path: string) => {
  if (!path.startsWith('#')) {
    throw new Error('path must start with #')
  }
  const p = path.slice(1)
  if (!p.startsWith('/')) {
    throw new Error('second character must be /')
  }
  if (p === page.value) {
    return
  }
  page.value = p
  // await page.finishChange()
}
const handleHashChange = async () => {
  if (page.val.changing) {
    // page.finishChange()
    return
  }
  const current = location.hash.slice(1) || '/'
  if (current !== page.value) {
    console.log('hashchange', current, page.value)
    page.value = current
  }
}
window.addEventListener('hashchange', handleHashChange)
window.addEventListener('popstate', handleHashChange)
window.addEventListener('load', handleHashChange)
handleHashChange()

export const pushState = async (path: string, state?: Record<string, unknown>) => {
  await goto(path)
}

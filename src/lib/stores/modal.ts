import { queryParam, ssp } from 'sveltekit-search-params'

export const type = queryParam<string>('modal', ssp.string(''), {
  showDefaults: false,
  pushHistory: false,
})

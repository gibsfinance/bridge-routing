import { queryParam, ssp } from 'sveltekit-search-params'

export const type = queryParam('modal', ssp.string(''), {
  showDefaults: false,
  pushHistory: false,
})

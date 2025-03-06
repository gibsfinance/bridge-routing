import { LocalProxy, LocalProxyProp } from './localstorage.svelte'

export type DefaultSettings = {
  showTooltips: boolean
}
const globalDefaultSettings: DefaultSettings = {
  showTooltips: true,
}
export const storage = new LocalProxy('gibs.finance.settings', globalDefaultSettings)

export const showTooltips = new LocalProxyProp(storage, ['showTooltips'], true)

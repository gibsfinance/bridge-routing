import { LocalProxy, LocalProxyProp } from './localstorage.svelte'

export type DefaultSettings = {
  showTooltips: boolean
}
const globalDefaultSettings: DefaultSettings = {
  showTooltips: true,
}
export const storage = new LocalProxy('gibs.finance.settings', globalDefaultSettings)

export const showTooltips = new LocalProxyProp(storage, ['showTooltips'], true)

export type ForeignBridgeInputs = {
  fromChain: number
  fromToken: string
  fromAmount: bigint
  // toChain: number - always 1
  toToken: string
}
export const foreignBridgeInputs = new LocalProxyProp(
  storage,
  ['foreignBridgeInputs'],
  null as ForeignBridgeInputs | null,
)

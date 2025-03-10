import { zeroAddress, type Hex } from 'viem'
import { LocalProxy, LocalProxyProp } from './localstorage.svelte'

export type DefaultSettings = {
  showTooltips: boolean
  foreignBridgeInputs: ForeignBridgeInputs | null
}
export type ForeignBridgeInputs = {
  fromChain: number
  fromToken: string
  fromAmount: bigint
  // toChain: number - always 1
  toToken: string
}
const globalDefaultSettings: DefaultSettings = {
  showTooltips: true,
  foreignBridgeInputs: {
    fromChain: 1,
    fromToken: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as Hex,
    fromAmount: 0n,
    toToken: zeroAddress as Hex,
  } as ForeignBridgeInputs | null,
}
export const storage = new LocalProxy('gibs.finance.settings', globalDefaultSettings)

export const showTooltips = new LocalProxyProp(storage, ['showTooltips'], true)

export const foreignBridgeInputs = new LocalProxyProp(
  storage,
  ['foreignBridgeInputs'],
  null as ForeignBridgeInputs | null,
)

export const activeOnboardStep = new LocalProxyProp(storage, ['activeOnboardStep'], 1)

export const plsOutToken = new LocalProxyProp(storage, ['plsOutToken'], zeroAddress as Hex)

export const bridgeTxHash = new LocalProxyProp(storage, ['bridgeTxHash'], null as Hex | null)

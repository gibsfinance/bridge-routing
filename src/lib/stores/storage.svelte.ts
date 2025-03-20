import { zeroAddress, type Hex } from 'viem'
import { LocalProxy, LocalProxyProp } from './localstorage.svelte'
import { FeeType } from './input.svelte'

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

export type PulsexTokens = {
  tokenIn: Hex
  tokenOut: Hex
}

export const plsxTokens = new LocalProxyProp(storage, ['plsxTokens'], null as PulsexTokens | null)

export type BridgeTx = {
  hash?: Hex | null
  showEdit?: boolean
}
export const bridgeTx = new LocalProxyProp(storage, ['bridgeTx'], null as BridgeTx | null)

export const advancedMode = new LocalProxyProp(storage, ['advancedMode'], false)

export type BridgeSettings = {
  feeType: FeeType
  amountToBridge: bigint
  unwrap: boolean
  costLimit: bigint
  deliveryFee: bigint
  deliveryFeeLocked: boolean
  costLimitLocked: boolean
}

export const bridgeSettings = new LocalProxyProp(storage, ['bridgeSettings'], {
  feeType: FeeType.PERCENT,
  unwrap: true,
  deliveryFeeLocked: false,
  costLimitLocked: false,
} as Partial<BridgeSettings> | null)

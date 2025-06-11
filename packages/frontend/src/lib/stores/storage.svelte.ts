import type { Hex } from 'viem'
import type { BridgeKey } from '@gibsfinance/bridge-sdk/types'

import { LocalProxy, LocalProxyProp } from './localstorage.svelte'
import { FeeType } from './input.svelte'

export type DefaultSettings = {
  onboardStage: number
}
const globalDefaultSettings: DefaultSettings = {
  onboardStage: 1,
}
export const storage = new LocalProxy('gibs.finance.settings', globalDefaultSettings)

// export type PulsexTokens = {
//   bridgeTokenIn: Hex
//   bridgeTokenOut: Hex
//   pulsexTokenIn: Hex
//   pulsexTokenOut: Hex
// }

// export const defaultOnboardTokens = new LocalProxyProp(
//   storage,
//   ['defaultOnboardTokens'],
//   null as PulsexTokens | null,
// )

export type BridgeTx = {
  hash?: Hex | null
  bridgeKey?: BridgeKey | null
  showEdit?: boolean | null
}
export const bridgeTx = new LocalProxyProp(storage, ['bridgeTx'], null as BridgeTx | null)

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

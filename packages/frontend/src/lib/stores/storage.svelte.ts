import type { Hex } from 'viem'
import type { BridgeKey } from '@gibsfinance/bridge-sdk/types'
import { FeeType } from '@gibsfinance/bridge-sdk/fee-type'

import { LocalProxy, LocalProxyProp } from './localstorage.svelte'

export type DefaultSettings = {
  onboardStage: number
}
const globalDefaultSettings: DefaultSettings = {
  onboardStage: 1,
}
export const storage = new LocalProxy('gibs.finance.settings', globalDefaultSettings)

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

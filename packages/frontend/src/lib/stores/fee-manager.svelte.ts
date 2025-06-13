import type { Hex } from 'viem'
import type { BridgeKey } from '@gibs/bridge-sdk/types'
import { SvelteMap } from 'svelte/reactivity'

export type PathwayExtendableConfig = {
  feeManager: Hex
  feeH2F: bigint
  feeF2H: bigint
}

export const settingKey = (bridgeKey: BridgeKey) => {
  const [provider, fromChain, toChain] = bridgeKey
  return `${provider}-${fromChain}-${toChain}`.toLowerCase()
}

export const settings = new SvelteMap<string, PathwayExtendableConfig>()

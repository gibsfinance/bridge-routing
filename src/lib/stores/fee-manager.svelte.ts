import type { Hex } from 'viem'
import { Chains, Provider } from './auth/types'
import type { BridgeKey } from './input.svelte'
import _ from 'lodash'

export type PathwayExtendableConfig = {
  feeManager: Hex
  feeH2F: bigint
  feeF2H: bigint
}

type Contents = Partial<Record<Chains, Partial<Record<Chains, PathwayExtendableConfig>>>>

export const feeCache = $state({
  [Provider.PULSECHAIN]: {} as Contents,
  [Provider.TOKENSEX]: {} as Contents,
})

export const settings = {
  get(bridgeKey: null | BridgeKey) {
    if (!bridgeKey) return
    return _.get(feeCache, bridgeKey) as PathwayExtendableConfig | undefined
  },
  set(bridgeKey: null | BridgeKey, value: PathwayExtendableConfig) {
    if (!bridgeKey) return
    const [provider, fromChain, toChain] = bridgeKey
    const update = {
      ...feeCache[provider],
      [fromChain]: {
        ...feeCache[provider]?.[fromChain],
        [toChain]: value,
      },
    }
    feeCache[provider] = update
  },
}

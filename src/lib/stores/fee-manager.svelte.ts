import type { Hex } from 'viem'
// import { Chains, Provider } from './auth/types'
import type { BridgeKey } from './input.svelte'
// import _ from 'lodash'
import { SvelteMap } from 'svelte/reactivity'

export type PathwayExtendableConfig = {
  feeManager: Hex
  feeH2F: bigint
  feeF2H: bigint
}

// type Contents = Partial<Record<Chains, Partial<Record<Chains, PathwayExtendableConfig>>>>

// export const feeCache = $state({
//   [Provider.PULSECHAIN]: {} as Contents,
//   [Provider.TOKENSEX]: {} as Contents,
// })

// export class BridgeSettings {
//   private feeCache = $state({
//     [Provider.PULSECHAIN]: {} as Contents,
//     [Provider.TOKENSEX]: {} as Contents,
//   })
//   // get(bridgeKey: null | BridgeKey) {
//   //   if (!bridgeKey) return
//   //   return _.get(this.feeCache, bridgeKey) as PathwayExtendableConfig | undefined
//   // }
//   set(bridgeKey: null | BridgeKey, value: PathwayExtendableConfig) {
//     if (!bridgeKey) return
//     const [provider, fromChain, toChain] = bridgeKey
//     const update = {
//       ...(this.feeCache[provider] ?? {}),
//       [fromChain]: {
//         ...(this.feeCache[provider]?.[fromChain] ?? {}),
//         [toChain]: value,
//       },
//     }
//     this.feeCache[provider] = update
//   }
// }

export const settingKey = (bridgeKey: BridgeKey) => {
  const [provider, fromChain, toChain] = bridgeKey
  return `${provider}-${fromChain}-${toChain}`.toLowerCase()
}

export const settings = new SvelteMap<string, PathwayExtendableConfig>([
  // [Provider.PULSECHAIN, {}],
  // [Provider.TOKENSEX, {}],
])

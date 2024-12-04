import type { Hex } from 'viem'
import { Chains, Provider } from './auth/types'
import type { BridgeKey } from './input'
import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { get as ldget } from 'lodash'

export type PathwayExtendableConfig = {
  feeManager: Hex
  feeH2F: bigint
  feeF2H: bigint
}

export const feeCache = writable<
  Record<Provider, Partial<Record<Chains, Partial<Record<Chains, PathwayExtendableConfig>>>>>
>({
  [Provider.PULSECHAIN]: {},
  [Provider.TOKENSEX]: {},
})

export const settings = {
  get($bridgeKey: null | BridgeKey) {
    if (!$bridgeKey) return
    return ldget(get(feeCache), $bridgeKey) as PathwayExtendableConfig | undefined
  },
  set($bridgeKey: null | BridgeKey, value: PathwayExtendableConfig) {
    if (!$bridgeKey) return
    const [provider, fromChain, toChain] = $bridgeKey
    feeCache.update(($feeCache) => ({
      ...$feeCache,
      [provider]: {
        ...($feeCache[provider] || {}),
        [fromChain]: {
          ...($feeCache[provider]?.[fromChain] || {}),
          [toChain]: value,
        },
      },
    }))
  },
}

// export const feeManagerMapping = new Map<Chains, Map<Chains, Settings>>([
//   [
//     Chains.PLS,
//     new Map<Chains, Settings>([
//       [
//         Chains.ETH,
//         {
//           bridge: '0xba86ca0aeca30247f9e2fd8736879997bcd01dc4',
//           feeH2F: 0n,
//           feeF2H: 0n,
//         },
//       ],
//       [
//         Chains.BNB,
//         {
//           bridge: '0xbb00578b4eb6a14081797463ec57ab00a973edba',
//           feeH2F: 0n,
//           feeF2H: 0n,
//         },
//       ],
//     ]),
//   ],
// ])

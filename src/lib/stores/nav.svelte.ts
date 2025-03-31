import type { Hex } from 'viem'
import { toPath, bridgeKey, type BridgeKey } from './input.svelte'
import { pushState } from '$app/navigation'

export const delivery = {
  shallow: (key: BridgeKey, assetIn: string) => {
    pushState(`#/delivery/${toPath(key)}/${assetIn}`, {})
    bridgeKey.value = key
    bridgeKey.assetInAddress = assetIn as Hex
  },
}

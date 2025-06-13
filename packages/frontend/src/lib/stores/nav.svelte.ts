import type { Hex } from 'viem'
import type { BridgeKey } from '@gibs/bridge-sdk/types'

import { toPath, bridgeKey } from './input.svelte'
import { page } from './app-page.svelte'

export const bridge = {
  shallow: (key: BridgeKey, assetIn?: string, params?: Record<string, string>) => {
    page.pushState(`/bridge/${toPath(key)}${assetIn ? `/${assetIn}` : ''}`, queryStringFromObject(params, [
      'settings',
      'details',
      'mode',
    ]))
    bridgeKey.value = key
    bridgeKey.assetInAddress = assetIn as Hex
  },
}

export const onboard = {
  shallow: (params?: Record<string, string>) => {
    page.pushState(`/onboard`, queryStringFromObject(params, [
      'settings',
      'bridgeTokenIn',
      'pulsexTokenOut',
      'mode',
      'guide',
      'onramps',
      'stage',
    ]))
  },
}

export const home = {
  shallow: () => {
    page.pushState('/')
  },
}

const queryStringFromObject = (params?: Record<string, string> | URLSearchParams, whitelist?: string[]): URLSearchParams | null => {
  if (!params) {
    // use existing
    return page.val.params
  }
  if (Object.keys(params).length === 0) {
    return new URLSearchParams()
  }
  const entries = filterEntries(Object.entries(params), whitelist)
  return new URLSearchParams(entries)
}

const filterEntries = (entries: [string, string][], whitelist?: string[]) => {
  return entries.filter(([key]) => !whitelist || !whitelist.includes(key))
}

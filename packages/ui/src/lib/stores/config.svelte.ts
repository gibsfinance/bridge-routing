import type { TokenList } from '@gibs/bridge-sdk/types'
import * as imageLinks from '@gibs/bridge-sdk/image-links'
import { type Hex, getAddress } from 'viem'
import _ from 'lodash'

import { ProxyStore } from '../types.svelte'
import { nodeEnv } from '../config'

export const isProd = new ProxyStore(nodeEnv === 'production')

export const blacklist = new Map<Hex, Hex>([])

// Filter out tokens with incorrect chainId (chainId/address combination)
// Format: "chainId/address" -> these tokens appear in lists with wrong chain
export const chainIdAddressBlacklist = new Set<string>([
  // PulseChain token incorrectly listed as Ethereum token
  `1/${getAddress('0xa1077a294dde1b09bb078844df40758a5d0f9a27').toLowerCase()}`,
])

export const whitelisted = new ProxyStore<Set<Hex>>(new Set<Hex>())

fetch(imageLinks.list('/pulsex'))
  .then(async (res) => (await res.json()) as TokenList)
  .then(({ tokens }) => {
    whitelisted.value = new Set<Hex>(tokens.map((tkn) => getAddress(tkn.address)))
  })

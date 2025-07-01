import type { TokenList } from '@gibs/bridge-sdk/types'
import * as imageLinks from '@gibs/bridge-sdk/image-links'
import { type Hex, getAddress } from 'viem'
import _ from 'lodash'

import { ProxyStore } from '../types.svelte'
import { nodeEnv } from '../config'

export const isProd = new ProxyStore(nodeEnv === 'production')

export const blacklist = new Map<Hex, Hex>([
  // [getAddress('0x97Ac4a2439A47c07ad535bb1188c989dae755341'), getAddress('0xa882606494d86804b5514e07e6bd2d6a6ee6d68a')],
])
export const whitelisted = new ProxyStore<Set<Hex>>(new Set<Hex>())

fetch(imageLinks.list('/pulsex'))
  .then(async (res) => (await res.json()) as TokenList)
  .then(({ tokens }) => {
    whitelisted.value = new Set<Hex>(tokens.map((tkn) => getAddress(tkn.address)))
  })

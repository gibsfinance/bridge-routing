import type { TokenList } from '@gibs/bridge-sdk/types'
import * as imageLinks from '@gibs/bridge-sdk/image-links'
import { type Hex, getAddress } from 'viem'
import _ from 'lodash'

import { ProxyStore } from '../types.svelte'
import { nodeEnv } from '../config'

export const isProd = new ProxyStore(nodeEnv === 'production')

export const blacklist = new Set<Hex>(['0xA882606494D86804B5514E07e6Bd2D6a6eE6d68A'])
export const whitelisted = new ProxyStore<Set<Hex>>(new Set<Hex>())

fetch(imageLinks.list('/pulsex'))
  .then(async (res) => (await res.json()) as TokenList)
  .then(({ tokens }) => {
    whitelisted.value = new Set<Hex>(tokens.map((tkn) => getAddress(tkn.address)))
  })

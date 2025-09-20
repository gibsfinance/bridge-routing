import type { Chain } from 'viem/chains'
import * as networks from 'viem/chains'

export const idToChain = new Map<number, Chain>(
  Object.values(networks).map((chain) => [chain.id, chain] as [number, Chain]),
)

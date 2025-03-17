import type { Chain } from 'viem/chains'
import * as networks from 'viem/chains'

/**
 * Add here your chain id as hex, be sure to add your chain in the chainsMetadata object too
 */
export enum Chains {
  PLS = '0x171',
  ETH = '0x1',
  BNB = '0x38',
  // testnets
  SEP = '0xaa36a7',
  V4PLS = '0x3af',
  // TBNB = '0x61',
}

export type ChainKey = keyof typeof Chains

export const chainIdToKey = new Map<Chains, ChainKey>(
  Object.entries(Chains).map(([key, chain]) => [chain, key] as [Chains, ChainKey]),
)

export const toChain = (chainId: number | string) => `0x${Number(chainId).toString(16)}` as Chains

export const toChainKey = (chainId: number | string) => chainIdToKey.get(toChain(chainId))

export type VisualChain = Chain & {
  chainId: Chains
  logoURI: string
  alt: string
}

export type ChainsMetadata = Record<Chains, VisualChain>

export enum Provider {
  PULSECHAIN = 'pulsechain',
  TOKENSEX = 'tokensex',
}

export const idToChain = new Map<number, Chain>(
  Object.values(networks).map((chain) => [chain.id, chain] as [number, Chain]),
)

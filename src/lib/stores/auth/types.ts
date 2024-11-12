import type { Chain } from 'viem/chains'

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

export const ChainIdToKey = new Map<Chains, ChainKey>(
  Object.entries(Chains).map(([key, chain]) => [chain, key] as [Chains, ChainKey]),
)

export const toChain = (chainId: number) => `0x${Number(chainId).toString(16)}` as Chains

export type VisualChain = Chain & {
  chainId: Chains
  icon: string
  alt: string
}

export type ChainsMetadata = Record<Chains, VisualChain>

export enum Provider {
  PULSECHAIN = 'pulsechain',
  TOKENSEX = 'tokensex',
}

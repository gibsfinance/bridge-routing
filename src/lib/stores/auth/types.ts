import type { Chain } from 'viem/chains'

/**
 * Add here your chain id as hex, be sure to add your chain in the chainsMetadata object too
 */
export enum Chains {
  PLS = '0x171',
  ETH = '0x1',
  BNB = '0x38',
  // OP = '0xa',
}

export type DestinationChains = Chains.ETH | Chains.BNB

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

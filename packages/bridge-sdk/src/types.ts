import type { Hex, Chain } from 'viem'
import type { Chains, Provider } from './config.js'

/** The per network bridge link */
export type PerNetworkBridgeLink = {
  tokenAddress: Hex
}
/** The extensions for a token */
export type Extensions = {
  wrapped?: { address: Hex }
  bridgeInfo?: Record<number, PerNetworkBridgeLink>
}

/** The metadata for a token */
export type TokenMetadata = {
  name: string
  symbol: string
  decimals: number
}

/** The token for a given asset */
export type Token = TokenMetadata & {
  address: string
  chainId: number
  logoURI: string | null
  extensions?: Extensions
}

/** The token out for a given asset */
export type TokenOut = Omit<Token, 'address'> & { address: string | null }

/** The token list for a given asset */
export type TokenList = {
  tokens: Token[]
}

/** The bridge key for a given provider, from chain, and to chain */
export type BridgeKey = [Provider, Chains, Chains]

/** The visual chain for a given chain */
export type VisualChain = Chain & {
  chainId: Chains
  logoURI: string
  alt: string
}

/** The metadata for a chain */
export type ChainsMetadata = Record<Chains, VisualChain>

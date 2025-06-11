import type { Hex, Chain } from 'viem'
import type { Chains, Provider } from './config.js'

export type PerNetworkBridgeLink = {
  tokenAddress: Hex
}
export type Extensions = {
  wrapped?: { address: Hex }
  bridgeInfo?: Record<number, PerNetworkBridgeLink>
}

export type TokenMetadata = {
  name: string
  symbol: string
  decimals: number
}

export type Token = TokenMetadata & {
  address: string
  chainId: number
  logoURI: string | null
  extensions?: Extensions
}

export type TokenOut = Omit<Token, 'address'> & { address: string | null }

export type TokenList = {
  tokens: Token[]
}

export type BridgeKey = [Provider, Chains, Chains]

export type VisualChain = Chain & {
  chainId: Chains
  logoURI: string
  alt: string
}

export type ChainsMetadata = Record<Chains, VisualChain>

import type { Hex, Abi } from 'viem'

export type Call = {
  allowFailure?: boolean
  functionName: string
  target?: Hex
  abi?: Abi
  args?: (bigint | Hex | Hex[])[]
}

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
  address: Hex
  chainId: number
  logoURI?: string
  extensions?: Extensions
}

export type TokenOut = Omit<Token, 'address'> & { address: Hex | null }

export type TokenList = {
  tokens: Token[]
}

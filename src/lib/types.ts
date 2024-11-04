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
  bridgeInfo?: Record<number, PerNetworkBridgeLink>
}

export type Token = {
  address: Hex
  name: string
  symbol: string
  decimals: number
  chainId: number
  logoURI?: string
  extensions?: Extensions
}

export type TokenList = {
  tokens: Token[]
}

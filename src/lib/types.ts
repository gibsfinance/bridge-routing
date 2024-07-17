import * as viem from 'viem'

export type Call = {
  allowFailure?: boolean
  functionName: string
  target?: viem.Hex
  abi?: viem.Abi
  args?: any[]
}

export type PerNetworkBridgeLink = {
  tokenAddress: viem.Hex;
  originationBridgeAddress: viem.Hex;
  destinationBridgeAddress: viem.Hex;
}
export type Extensions = {
  bridgeInfo?: Record<number, PerNetworkBridgeLink>
}

export type Token = {
  address: viem.Hex;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  chainId: number;
  extensions?: Extensions
}

export type TokenList = {
  tokens: Token[]
}

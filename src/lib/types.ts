import * as viem from 'viem'

export type Call = {
  allowFailure?: boolean
  functionName: string
  target?: viem.Hex
  abi?: viem.Abi
  args?: any[]
}

export type Token = {
  address: viem.Hex;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export type TokenList = {
  tokens: Token[]
}

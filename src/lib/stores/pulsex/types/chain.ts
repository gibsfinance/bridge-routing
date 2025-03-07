import { Token } from '@pulsex/sdk'
import { ChainId } from '@pulsex/chains'

// a list of tokens by chain
export type ChainMap<T> = {
  readonly [chainId in ChainId]: T
}

export type ChainTokenList = ChainMap<Token[]>

import type { Token } from '@pulsex/sdk'
import type { ChainId } from '@pulsex/chains'

// a list of tokens by chain
export type ChainMap<T> = {
  readonly [chainId in ChainId]: T
}

export type ChainTokenList = ChainMap<Token[]>

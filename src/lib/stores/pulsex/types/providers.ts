import type { Currency, BigintIsh } from '@pulsex/sdk'
import type { ChainId } from '@pulsex/chains'
import type { PublicClient } from 'viem'
import type { GraphQLClient } from 'graphql-request'
import type { Options as RetryOptions } from 'async-retry'

import type { AbortControl } from './utils'
import type { Pool, PoolType } from './pool'
import type { RouteWithoutQuote, RouteWithQuote } from './route'
import type { GasModel } from './gasModel'
import type { BatchMulticallConfigs } from './multicall'
import type { ChainMap } from './chain'

type GetPoolParams = {
  currencyA?: Currency
  currencyB?: Currency
  blockNumber?: BigintIsh
  protocols?: PoolType[]

  // Only use this param if we want to specify pairs we want to get
  pairs?: [Currency, Currency][]
} & AbortControl

export interface PoolProvider {
  getCandidatePools: (params: GetPoolParams) => Promise<Pool[]>
}

export type QuoteRetryOptions = RetryOptions

export type QuoterOptions = {
  blockNumber?: BigintIsh
  gasModel: GasModel
  retry?: QuoteRetryOptions
} & AbortControl

export type QuoterConfig = {
  onChainProvider: OnChainProvider
  gasLimit?: BigintIsh
  multicallConfigs?: ChainMap<BatchMulticallConfigs>
}

export interface QuoteProvider {
  getRouteWithQuotesExactIn: (
    routes: RouteWithoutQuote[],
    options: QuoterOptions,
  ) => Promise<RouteWithQuote[]>
  getRouteWithQuotesExactOut: (
    routes: RouteWithoutQuote[],
    options: QuoterOptions,
  ) => Promise<RouteWithQuote[]>

  getConfig?: () => QuoterConfig
}

export type OnChainProvider = ({ chainId }: { chainId?: ChainId }) => PublicClient | undefined

export type SubgraphProvider = ({ chainId }: { chainId?: ChainId }) => GraphQLClient | undefined

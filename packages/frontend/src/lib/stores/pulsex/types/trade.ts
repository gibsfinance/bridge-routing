import type { BigintIsh, Currency, CurrencyAmount, TradeType } from '@pulsex/sdk'

import type { PoolType } from './pool'
import type { AbortControl } from './utils'
import type { PoolProvider, QuoteProvider } from './providers'
import type { Route } from './route'
import type { Address, Hex } from 'viem'

export interface TransactionData {
  data: Hex
  to: Address
  value: Hex
  gasLimit: Hex
}

export interface SmartRouterTrade<TTradeType extends TradeType> {
  tradeType: TTradeType
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>

  // From routes we know how many splits and what percentage does each split take
  routes: Route[]

  gasEstimate: bigint
  gasEstimateInUSD?: CurrencyAmount<Currency>
  blockNumber?: number
}

export type PriceReferences = {
  quoteCurrencyUsdPrice?: number
  nativeCurrencyUsdPrice?: number
}

export type BaseTradeConfig = {
  gasPriceWei: BigintIsh | (() => Promise<BigintIsh>)
  maxHops?: number
  maxSplits?: number
  distributionPercent?: number
  allowedPoolTypes?: PoolType[]
  poolProvider: PoolProvider
}

export type TradeConfig = BaseTradeConfig & {
  blockNumber?: number | (() => Promise<number>)
  quoteProvider: QuoteProvider
  quoterOptimization?: boolean
} & PriceReferences &
  AbortControl

export type RouteConfig = TradeConfig & {
  blockNumber?: number
}

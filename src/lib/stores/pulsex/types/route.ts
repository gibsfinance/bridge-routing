import type { Currency, CurrencyAmount } from '@pulsex/sdk'

import type { GasCost } from './gasCost'
import type { Pool } from './pool'

export enum RouteType {
  V1,
  V2,
  STABLE,
  MIXED,
}

export interface BaseRoute {
  // Support all v1, v2, stable, and combined
  // Can derive from pools
  type: RouteType

  // Pools that swap will go through
  pools: Pool[]

  path: Currency[]

  input: Currency

  output: Currency
}

export interface RouteWithoutQuote extends BaseRoute {
  percent: number
  amount: CurrencyAmount<Currency>
}

export type RouteEssentials = Omit<RouteWithoutQuote, 'input' | 'output' | 'amount'>

export interface Route extends RouteEssentials {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
}

export interface RouteQuote extends GasCost {
  // If exact in, this is (quote - gasCostInToken). If exact out, this is (quote + gasCostInToken).
  quoteAdjustedForGas: CurrencyAmount<Currency>
  quote: CurrencyAmount<Currency>
}

export type RouteWithQuote = RouteWithoutQuote & RouteQuote

export type RouteWithoutGasEstimate = Omit<
  RouteWithQuote,
  'quoteAdjustedForGas' | 'gasEstimate' | 'gasCostInToken' | 'gasCostInUSD'
>

export interface BestRoutes {
  gasEstimate: bigint
  gasEstimateInUSD: CurrencyAmount<Currency>
  routes: Route[]
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
}

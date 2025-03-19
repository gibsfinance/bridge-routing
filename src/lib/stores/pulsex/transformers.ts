import type { ChainId } from '@pulsex/chains'
import { type Currency, CurrencyAmount, ERC20Token, Native, Percent, TradeType } from '@pulsex/sdk'
import { type Address, zeroAddress } from 'viem'
import {
  type Pool,
  PoolType,
  type Route,
  type SmartRouterTrade,
  type StablePool,
  type V1Pool,
  type V2Pool,
} from './types'
import { isStablePool, isV1Pool, isV2Pool } from './pool'

const ONE_HUNDRED = 100n

export interface SerializedCurrency {
  address: Address
  decimals: number
  symbol: string
}

export interface SerializedCurrencyAmount {
  currency: SerializedCurrency
  value: string
}

export interface SerializedV1Pool extends Omit<V1Pool, 'reserve0' | 'reserve1'> {
  reserve0: SerializedCurrencyAmount
  reserve1: SerializedCurrencyAmount
}

export interface SerializedV2Pool extends Omit<V2Pool, 'reserve0' | 'reserve1'> {
  reserve0: SerializedCurrencyAmount
  reserve1: SerializedCurrencyAmount
}

export interface SerializedStablePool extends Omit<StablePool, 'balances' | 'amplifier' | 'fee'> {
  balances: SerializedCurrencyAmount[]
  amplifier: string
  fee: string
}

export type SerializedPool = SerializedV1Pool | SerializedV2Pool | SerializedStablePool

export interface SerializedRoute
  extends Omit<Route, 'pools' | 'path' | 'input' | 'output' | 'inputAmount' | 'outputAmount'> {
  pools: SerializedPool[]
  path: SerializedCurrency[]
  inputAmount: SerializedCurrencyAmount
  outputAmount: SerializedCurrencyAmount
}

export interface SerializedTrade
  extends Omit<
    SmartRouterTrade<TradeType>,
    'inputAmount' | 'outputAmount' | 'gasEstimate' | 'gasEstimateInUSD' | 'routes'
  > {
  inputAmount: SerializedCurrencyAmount
  outputAmount: SerializedCurrencyAmount
  gasEstimate: string
  gasEstimateInUSD?: SerializedCurrencyAmount
  routes: SerializedRoute[]
}

export function serializeCurrency(currency: Currency): SerializedCurrency {
  return {
    address: currency.isNative ? zeroAddress : currency.wrapped.address,
    decimals: currency.decimals,
    symbol: currency.symbol,
  }
}

export function serializeCurrencyAmount(
  amount: CurrencyAmount<Currency>,
): SerializedCurrencyAmount {
  return {
    currency: serializeCurrency(amount.currency),
    value: amount.quotient.toString(),
  }
}

export function serializePool(pool: Pool): SerializedPool {
  if (isV1Pool(pool)) {
    return {
      ...pool,
      reserve0: serializeCurrencyAmount(pool.reserve0),
      reserve1: serializeCurrencyAmount(pool.reserve1),
    }
  }
  if (isV2Pool(pool)) {
    return {
      ...pool,
      reserve0: serializeCurrencyAmount(pool.reserve0),
      reserve1: serializeCurrencyAmount(pool.reserve1),
    }
  }
  if (isStablePool(pool)) {
    return {
      ...pool,
      address: pool.address,
      balances: pool.balances.map(serializeCurrencyAmount),
      amplifier: pool.amplifier.toString(),
      fee: pool.fee.toSignificant(6),
    }
  }
  throw new Error('Cannot serialize unsupoorted pool')
}

export function serializeRoute(route: Route): SerializedRoute {
  return {
    ...route,
    pools: route.pools.map(serializePool),
    path: route.path.map(serializeCurrency),
    inputAmount: serializeCurrencyAmount(route.inputAmount),
    outputAmount: serializeCurrencyAmount(route.outputAmount),
  }
}

export function serializeTrade(trade: SmartRouterTrade<TradeType>): SerializedTrade {
  return {
    ...trade,
    inputAmount: serializeCurrencyAmount(trade.inputAmount),
    outputAmount: serializeCurrencyAmount(trade.outputAmount),
    routes: trade.routes.map(serializeRoute),
    gasEstimate: trade.gasEstimate.toString(),
    gasEstimateInUSD: trade.gasEstimateInUSD && serializeCurrencyAmount(trade.gasEstimateInUSD),
  }
}

export function parseCurrency(chainId: ChainId, currency: SerializedCurrency): Currency {
  if (currency.address === zeroAddress) {
    return Native.onChain(chainId)
  }
  const { address, decimals, symbol } = currency
  return new ERC20Token(chainId, address, decimals, symbol)
}

export function parseCurrencyAmount(
  chainId: ChainId,
  amount: SerializedCurrencyAmount,
): CurrencyAmount<Currency> {
  return CurrencyAmount.fromRawAmount(parseCurrency(chainId, amount.currency), amount.value)
}

export function parsePool(chainId: ChainId, pool: SerializedPool): Pool {
  if (pool.type === PoolType.V1) {
    return {
      ...pool,
      reserve0: parseCurrencyAmount(chainId, pool.reserve0),
      reserve1: parseCurrencyAmount(chainId, pool.reserve1),
    }
  }
  if (pool.type === PoolType.V2) {
    return {
      ...pool,
      reserve0: parseCurrencyAmount(chainId, pool.reserve0),
      reserve1: parseCurrencyAmount(chainId, pool.reserve1),
    }
  }
  if (pool.type === PoolType.STABLE) {
    return {
      ...pool,
      address: pool.address,
      balances: pool.balances.map((b) => parseCurrencyAmount(chainId, b)),
      amplifier: BigInt(pool.amplifier),
      fee: new Percent(parseFloat(pool.fee) * 1000000, ONE_HUNDRED * 1000000n),
    }
  }

  throw new Error('Cannot parse unsupoorted pool')
}

export function parseRoute(chainId: ChainId, route: SerializedRoute): Route {
  return {
    ...route,
    pools: route.pools.map((p) => parsePool(chainId, p)),
    path: route.path.map((c) => parseCurrency(chainId, c)),
    inputAmount: parseCurrencyAmount(chainId, route.inputAmount),
    outputAmount: parseCurrencyAmount(chainId, route.outputAmount),
  }
}

export function parseTrade(chainId: ChainId, trade: SerializedTrade): SmartRouterTrade<TradeType> {
  return {
    ...trade,
    inputAmount: parseCurrencyAmount(chainId, trade.inputAmount),
    outputAmount: parseCurrencyAmount(chainId, trade.outputAmount),
    routes: trade.routes.map((r) => parseRoute(chainId, r)),
    gasEstimate: trade.gasEstimate ? BigInt(trade.gasEstimate) : 0n,
    gasEstimateInUSD:
      trade.gasEstimateInUSD && parseCurrencyAmount(chainId, trade.gasEstimateInUSD),
  }
}

import { type Currency, PairV1, PairV2, Price, CurrencyAmount } from '@pulsex/sdk'
// import { getSwapOutput } from '@pulsex/stable-swap-sdk'
import memoize from 'lodash/memoize.js'
import { type Address, parseUnits } from 'viem'

import { PoolType, type Pool, type StablePool, type V1Pool, type V2Pool } from './types'
import { getSwapOutput } from './swap-output'

// try to parse a user entered amount for a given token
export function tryParseAmount<T extends Currency>(
  value?: string,
  currency?: T | null,
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(
      value.replace(/[,\s]/g, '') as `${number}`,
      currency.decimals,
    ).toString()
    // const typedValueParsed = parseUnits(value as `${number}`, currency.decimals).toString()

    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

export function isV1Pool(pool: Pool): pool is V1Pool {
  return pool.type === PoolType.V1
}

export function isV2Pool(pool: Pool): pool is V2Pool {
  return pool.type === PoolType.V2
}

export function isStablePool(pool: Pool): pool is StablePool {
  return pool.type === PoolType.STABLE && pool.balances.length >= 2
}

export function involvesCurrency(pool: Pool, currency: Currency) {
  const token = currency.wrapped
  if (isV1Pool(pool) || isV2Pool(pool)) {
    const { reserve0, reserve1 } = pool
    return reserve0.currency.equals(token) || reserve1.currency.equals(token)
  }
  if (isStablePool(pool)) {
    const { balances } = pool
    return balances.some((b) => b.currency.equals(token))
  }
  return false
}

export function getOutputCurrency(pool: Pool, currencyIn: Currency): Currency {
  const tokenIn = currencyIn.wrapped
  if (isV1Pool(pool) || isV2Pool(pool)) {
    const { reserve0, reserve1 } = pool
    return reserve0.currency.equals(tokenIn) ? reserve1.currency : reserve0.currency
  }
  if (isStablePool(pool)) {
    const { balances } = pool
    if (balances.length === 3) {
      // stable tri pool picks output currency that has a greater balance
      return balances[0].currency.equals(tokenIn)
        ? balances[2].greaterThan(balances[1])
          ? balances[2].currency
          : balances[1].currency
        : balances[1].currency.equals(tokenIn)
          ? balances[0].greaterThan(balances[2])
            ? balances[0].currency
            : balances[2].currency
          : balances[0].greaterThan(balances[1])
            ? balances[0].currency
            : balances[1].currency
    }
    return balances[0].currency.equals(tokenIn) ? balances[1].currency : balances[0].currency
  }
  throw new Error('Cannot get output currency by invalid pool')
}

export const computeV1PoolAddress = memoize(
  PairV1.getAddress,
  (tokenA, tokenB) => `${tokenA.chainId}_${tokenA.address}_${tokenB.address}`,
)

export const computeV2PoolAddress = memoize(
  PairV2.getAddress,
  (tokenA, tokenB) => `${tokenA.chainId}_${tokenA.address}_${tokenB.address}`,
)

export const getPoolAddress = memoize(
  function getAddress(pool: Pool): Address | '' {
    if (isStablePool(pool)) {
      return pool.address
    }
    if (isV1Pool(pool)) {
      const { reserve0, reserve1 } = pool
      return computeV1PoolAddress(reserve0.currency.wrapped, reserve1.currency.wrapped)
    }
    if (isV2Pool(pool)) {
      const { reserve0, reserve1 } = pool
      return computeV2PoolAddress(reserve0.currency.wrapped, reserve1.currency.wrapped)
    }
    return ''
  },
  (pool) => {
    if (isStablePool(pool)) {
      const { balances } = pool
      const tokenAddresses = balances.map((b) => b.currency.wrapped.address)
      return `${pool.type}_${balances[0]?.currency.chainId}_${tokenAddresses.join('_')}`
    }
    const [token0, token1] = [pool.reserve0.currency.wrapped, pool.reserve1.currency.wrapped]
    const fee = isV1Pool(pool) ? 1 : 2
    return `${pool.type}_${token0.chainId}_${token0.address}_${token1.address}_${fee}`
  },
)

export function getTokenPrice(
  pool: Pool,
  base: Currency,
  quote: Currency,
): Price<Currency, Currency> {
  if (isV1Pool(pool)) {
    const pair = new PairV1(pool.reserve0.wrapped, pool.reserve1.wrapped)
    return pair.priceOf(base.wrapped)
  }

  if (isV2Pool(pool)) {
    const pair = new PairV2(pool.reserve0.wrapped, pool.reserve1.wrapped)
    return pair.priceOf(base.wrapped)
  }

  // FIXME now assume price of stable pair is 1
  if (isStablePool(pool)) {
    const { amplifier, balances, fee } = pool
    const baseIn = tryParseAmount('1', base)
    if (!baseIn) {
      throw new Error(`Cannot parse amount for ${base.symbol}`)
    }
    const quoteOut = getSwapOutput({
      amplifier,
      balances,
      fee,
      outputCurrency: quote,
      amount: baseIn,
    })

    return new Price({
      baseAmount: baseIn,
      quoteAmount: quoteOut,
    })
  }
  return new Price(base, quote, 1n, 0n)
}

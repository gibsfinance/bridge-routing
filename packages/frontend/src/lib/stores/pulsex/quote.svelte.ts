import _ from 'lodash'
import type { TradeType } from '@pulsex/swap-sdk-core'
import type { Hex } from 'viem'
import type { Token } from '@gibs/bridge-sdk/types'
import { Chains } from '@gibs/bridge-sdk/config'
import { jsonAnyStringify } from '@gibs/common/serialize'

import { loading } from '../loading.svelte'

import type { SerializedTrade } from './transformers'
import { clientFromChain } from '../input.svelte'
import { getTransactionDataFromTrade } from './serialize'

export type PulsexQuoteArgs = {
  amountIn: bigint | null
  amountOut: bigint | null
  tokenIn: Token
  tokenOut: Token
}
export type PulsexCurrency = {
  address: Hex
  decimals: number
  symbol: string
}
export type PulsexAmount = {
  currency: PulsexCurrency
  value: string
}
export type PulsexQuoteInput = {
  currency: PulsexCurrency
  chainId: number
  amount: PulsexAmount
  tradeType: TradeType
}
type QuoteResult = {
  success: boolean
  error?: unknown
  trade?: SerializedTrade
}
const cache = new Map<string, { timestamp: number, result: Promise<QuoteResult> }>()
export const getPulseXQuote = loading.loadsAfterTick<QuoteResult, PulsexQuoteArgs>(
  'pulsex-quote',
  async (
    { amountOut, amountIn, tokenIn, tokenOut }: PulsexQuoteArgs,
    controller: AbortController,
  ) => {
    const tradeType = amountIn ? 0 : 1
    const poolTypes = [0, 1, 2].filter((t) => (tradeType === 1 ? t !== 2 : true))
    const swapAmountOut = Boolean(tradeType)
    const i = swapAmountOut ? tokenOut : tokenIn
    const o = swapAmountOut ? tokenIn : tokenOut
    const amount = {
      currency: {
        address: i.address,
        decimals: i.decimals,
        symbol: i.symbol,
      },
      value: (swapAmountOut ? amountOut?.toString() : amountIn?.toString()) ?? '0',
    }
    const currencyOut = {
      address: o.address,
      decimals: o.decimals,
      symbol: o.symbol,
    }
    const body = {
      poolTypes,
      chainId: Number(Chains.PLS),
      amount,
      tradeType,
      currency: currencyOut,
    } as PulsexQuoteInput
    const cacheKey = JSON.stringify(body, jsonAnyStringify)
    for (const [key, value] of cache) {
      if (value.timestamp < Date.now() - (1000 * 5)) {
        cache.delete(key)
      }
    }
    const cached = cache.get(cacheKey)
    if (cached) {
      return cached.result
    }
    const result = new Promise<SerializedTrade>((resolve, reject) => {
      quoteFetch<SerializedTrade>(body, controller, {
        resolve,
        reject,
      })
    }).then((quote) => {
      return { success: true, trade: quote }
    }).catch((err) => {
      return { success: false, error: err }
    })
    cache.set(cacheKey, {
      timestamp: Date.now(),
      result,
    })
    return result
  },
  async (result: QuoteResult) => {
    if (!result.success) return result
    const pulsechainClient = clientFromChain(Number(Chains.PLS))

    const transactionInfo = getTransactionDataFromTrade(
      Number(Chains.PLS),
      result.trade!,
    )
    const estimate = await pulsechainClient.estimateGas({
      ...transactionInfo,
      value: BigInt(transactionInfo.value ?? '0'),
    }).catch((err) => {
      // could fail due to reversion or network issue
      console.log(err)
      return err.code === 'UNPREDICTABLE_GAS_LIMIT' ? null : err
    })
    if (typeof estimate === 'bigint') {
      const tradeEstimate = BigInt(result.trade!.gasEstimate)
      if (tradeEstimate < estimate) {
        result.trade!.gasEstimate = estimate.toString()
      }
    } else if (!estimate) {
      return {
        success: false,
        error: 'UNPREDICTABLE_GAS_LIMIT',
      }
    }
    return result
  },
)

const quoteFetch = async <T>(
  body: PulsexQuoteInput,
  controller: AbortController,
  {
    resolve,
    reject,
  }: {
    resolve: (value: T) => void
    reject: (reason?: unknown) => void
  },
) => {
  const quoteURL = 'https://routing-v3.a4056c9392ff6eb5fa7904d106b55a.workers.dev/quote'
  if (controller.signal.aborted) {
    reject()
    return null
  }
  const quote = await fetch(quoteURL, {
    method: 'POST',
    body: JSON.stringify(body),
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!quote.ok) {
    reject(new Error(`Failed to fetch quote: ${quote.statusText}`))
    return null
  }
  const result = (await quote.json()) as T
  resolve(result)
}

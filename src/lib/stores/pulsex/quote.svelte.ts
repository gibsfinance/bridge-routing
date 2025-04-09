import _ from 'lodash'
import type { TradeType } from '@pulsex/swap-sdk-core'
import type { Hex } from 'viem'

import { Chains } from '../auth/types'
import { loading } from '../loading.svelte'
import type { Token } from '../../types.svelte'

import type { SerializedTrade } from './transformers'

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
// export type PulsexPathStep = PulsexCurrency
// export type PulsexReserve = PulsexAmount
// export type PulsexPool = {
//   address: string | Hex
//   type: number
//   reserve0: PulsexReserve
//   reserve1: PulsexReserve
// }
// export type PulsexRoute = {
//   inputAmount: PulsexAmount
//   outputAmount: PulsexAmount
//   path: PulsexPathStep[]
//   pools: PulsexPool[]
// }
// export type PulsexQuoteOutput = {
//   blockNumber: number | null
//   gasEstimate: string // number
//   gasEstimateInUSD: PulsexAmount
//   inputAmount: PulsexAmount
//   outputAmount: PulsexAmount
//   tradeType: TradeType
//   routes: PulsexRoute[]
// }
export const getPulseXQuote = loading.loadsAfterTick<SerializedTrade, PulsexQuoteArgs>(
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
    return new Promise((resolve, reject) => {
      const quote = quoteFetch(body, controller, {
        resolve,
        reject,
      })
      if (!quote) return
      return quote.catch(() => {})
    })
  },
)

const quoteFetch = _.debounce(
  async (
    body: PulsexQuoteInput,
    controller: AbortController,
    {
      resolve,
      reject,
    }: {
      resolve: (value: SerializedTrade | null) => void
      reject: (reason?: unknown) => void
    },
  ) => {
    const quoteURL = 'https://routing-v3.a4056c9392ff6eb5fa7904d106b55a.workers.dev/quote'
    if (controller.signal.aborted) {
      reject()
      return null
    }
    // console.log('fetch', body)
    const quote = await fetch(quoteURL, {
      method: 'POST',
      body: JSON.stringify(body),
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const result = (await quote.json()) as SerializedTrade
    resolve(result)
  },
  1_000,
)

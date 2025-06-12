import { Percent } from '@pulsex/swap-sdk-core'
import { SwapRouter, type SwapOptions } from './swap-router'
import { parseTrade, type SerializedTrade } from './transformers'

export const getTransactionDataFromTrade = (
  chainId: number,
  trade: SerializedTrade,
  options: Partial<SwapOptions> = {},
) => {
  const parsed = parseTrade(chainId, trade)
  return SwapRouter.swapCallParameters(parsed, {
    slippageTolerance: new Percent(100, 10_000),
    deadlineOrPreviousBlockhash: Math.floor((Date.now() + 1000 * 60 * 5) / 1_000),
    ...options,
  })
}

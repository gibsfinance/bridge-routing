import {
  type Currency,
  CurrencyAmount,
  Percent,
  TradeType,
  validateAndParseAddress,
} from '@pulsex/sdk'
import {
  type FeeOptions,
  type MethodParameters,
  type PermitOptions,
  Payments,
  SelfPermit,
  // toHex,
} from '@pulsex/v3-sdk'
import invariant from 'tiny-invariant'

import { PulseXSwapRouterAbi } from './abis/IPulseXSwapRouter'
import { ADDRESS_THIS, MSG_SENDER } from './constants'
import { type SmartRouterTrade, type BaseRoute, RouteType, type StablePool } from './types'
import { MulticallExtended, type Validation } from './multicall-extended'
import { PaymentsExtended } from './payments-extended'
import { partitionMixedRouteByProtocol } from './partition-mixed-route-by-protocol'
import { maximumAmountIn, minimumAmountOut } from './maximum-amount'
import { isStablePool, isV1Pool, isV2Pool } from './pool'
import { buildBaseRoute } from './route'
import { getOutputOfPools } from './get-output-of-pools'
import { encodeFunctionData, numberToHex, type Address, type Hex } from 'viem'

const ZERO = 0n

/**
 * Options for producing the arguments to send calls to the router.
 */
export interface SwapOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  slippageTolerance: Percent

  /**
   * The account that should receive the output. If omitted, output is sent to msg.sender.
   */
  recipient?: Address

  /**
   * Either deadline (when the transaction expires, in epoch seconds), or previousBlockhash.
   */
  deadlineOrPreviousBlockhash?: Validation

  /**
   * The optional permit parameters for spending the input.
   */
  inputTokenPermit?: PermitOptions

  /**
   * Optional information for taking a fee on output.
   */
  fee?: FeeOptions
}

export interface SwapAndAddOptions extends SwapOptions {
  /**
   * The optional permit parameters for pulling in remaining output token.
   */
  outputTokenPermit?: PermitOptions
}

type AnyTradeType = SmartRouterTrade<TradeType> | SmartRouterTrade<TradeType>[]

/**
 * Represents the PulseX V1 + V2 + StableSwap PulseXSwapRouter, and has static methods for helping execute trades.
 */
export abstract class SwapRouter {
  public static ABI = PulseXSwapRouterAbi

  /**
   * @notice Generates the calldata for a Swap with a V2 Route.
   * @param trade The V2Trade to encode.
   * @param options SwapOptions to use for the trade.
   * @param routerMustCustody Flag for whether funds should be sent to the router
   * @param performAggregatedSlippageCheck Flag for whether we want to perform an aggregated slippage check
   * @returns A string array of calldatas for the trade.
   */
  private static encodeV1Swap(
    trade: SmartRouterTrade<TradeType>,
    options: SwapOptions,
    routerMustCustody: boolean,
    performAggregatedSlippageCheck: boolean,
  ): Hex {
    const amountIn: bigint = maximumAmountIn(trade, options.slippageTolerance).quotient
    const amountOut: bigint = minimumAmountOut(trade, options.slippageTolerance).quotient

    // V1 trade should have only one route
    const route = trade.routes[0]
    const path = route.path.map((token) => token.wrapped.address)
    const recipient = routerMustCustody
      ? ADDRESS_THIS
      : typeof options.recipient === 'undefined'
        ? MSG_SENDER
        : validateAndParseAddress(options.recipient)

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      const exactInputParams = [
        amountIn,
        performAggregatedSlippageCheck ? 0n : amountOut,
        path,
        recipient,
      ] as const

      return encodeFunctionData({
        abi: SwapRouter.ABI,
        functionName: 'swapExactTokensForTokensV1',
        args: exactInputParams,
      })
    }
    const exactOutputParams = [amountOut, amountIn, path, recipient] as const

    return encodeFunctionData({
      abi: SwapRouter.ABI,
      functionName: 'swapTokensForExactTokensV1',
      args: exactOutputParams,
    })
  }

  /**
   * @notice Generates the calldata for a Swap with a V2 Route.
   * @param trade The V2Trade to encode.
   * @param options SwapOptions to use for the trade.
   * @param routerMustCustody Flag for whether funds should be sent to the router
   * @param performAggregatedSlippageCheck Flag for whether we want to perform an aggregated slippage check
   * @returns A string array of calldatas for the trade.
   */
  private static encodeV2Swap(
    trade: SmartRouterTrade<TradeType>,
    options: SwapOptions,
    routerMustCustody: boolean,
    performAggregatedSlippageCheck: boolean,
  ): Hex {
    const amountIn: bigint = maximumAmountIn(trade, options.slippageTolerance).quotient
    const amountOut: bigint = minimumAmountOut(trade, options.slippageTolerance).quotient

    // V2 trade should have only one route
    const route = trade.routes[0]
    const path = route.path.map((token) => token.wrapped.address)
    const recipient = routerMustCustody
      ? ADDRESS_THIS
      : typeof options.recipient === 'undefined'
        ? MSG_SENDER
        : validateAndParseAddress(options.recipient)

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      const exactInputParams = [
        amountIn,
        performAggregatedSlippageCheck ? 0n : amountOut,
        path,
        recipient,
      ] as const

      return encodeFunctionData({
        abi: SwapRouter.ABI,
        functionName: 'swapExactTokensForTokensV2',
        args: exactInputParams,
      })
    }
    const exactOutputParams = [amountOut, amountIn, path, recipient] as const

    return encodeFunctionData({
      abi: SwapRouter.ABI,
      functionName: 'swapTokensForExactTokensV2',
      args: exactOutputParams,
    })
  }

  /**
   * @notice Generates the calldata for a Swap with a Stable Route.
   * @param trade The Trade to encode.
   * @param options SwapOptions to use for the trade.
   * @param routerMustCustody Flag for whether funds should be sent to the router
   * @param performAggregatedSlippageCheck Flag for whether we want to perform an aggregated slippage check
   * @returns A string array of calldatas for the trade.
   */
  private static encodeStableSwap(
    trade: SmartRouterTrade<TradeType>,
    options: SwapOptions,
    routerMustCustody: boolean,
    performAggregatedSlippageCheck: boolean,
  ): Hex {
    const amountIn: bigint = maximumAmountIn(trade, options.slippageTolerance).quotient
    const amountOut: bigint = minimumAmountOut(trade, options.slippageTolerance).quotient

    if (trade.routes.length > 1 || trade.routes[0].pools.some((p) => !isStablePool(p))) {
      throw new Error('Unsupported trade to encode')
    }

    // Stable trade should only have one route
    const route = trade.routes[0]
    const path = route.path.map((token) => token.wrapped.address)
    const pools = route.pools.map((p) => (p as StablePool).address)
    const recipient = routerMustCustody
      ? ADDRESS_THIS
      : typeof options.recipient === 'undefined'
        ? MSG_SENDER
        : validateAndParseAddress(options.recipient)

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      const exactInputParams = [
        path,
        pools,
        amountIn,
        performAggregatedSlippageCheck ? 0n : amountOut,
        recipient,
      ] as const
      return encodeFunctionData({
        abi: SwapRouter.ABI,
        functionName: 'exactInputStableSwap',
        args: exactInputParams,
      })
    }
    const exactOutputParams = [path, pools, amountOut, amountIn, recipient] as const

    return encodeFunctionData({
      abi: SwapRouter.ABI,
      functionName: 'exactOutputStableSwap',
      args: exactOutputParams,
    })
  }

  /**
   * @notice Generates the calldata for a MixedRouteSwap. Since single hop routes are not MixedRoutes, we will instead generate
   *         them via the existing encodeV1Swap and encodeV2Swap methods.
   * @param trade The MixedRouteTrade to encode.
   * @param options SwapOptions to use for the trade.
   * @param routerMustCustody Flag for whether funds should be sent to the router
   * @param performAggregatedSlippageCheck Flag for whether we want to perform an aggregated slippage check
   * @returns A string array of calldatas for the trade.
   */
  private static encodeMixedRouteSwap(
    trade: SmartRouterTrade<TradeType>,
    options: SwapOptions,
    routerMustCustody: boolean,
    performAggregatedSlippageCheck: boolean,
  ): Hex[] {
    let calldatas: Hex[] = []

    const isExactIn = trade.tradeType === TradeType.EXACT_INPUT

    for (const route of trade.routes) {
      const { inputAmount, outputAmount, pools } = route
      const amountIn: bigint = maximumAmountIn(
        trade,
        options.slippageTolerance,
        inputAmount,
      ).quotient
      const amountOut: bigint = minimumAmountOut(
        trade,
        options.slippageTolerance,
        outputAmount,
      ).quotient

      // flag for whether the trade is single hop or not
      const singleHop = pools.length === 1

      const recipient = routerMustCustody
        ? ADDRESS_THIS
        : typeof options.recipient === 'undefined'
          ? MSG_SENDER
          : validateAndParseAddress(options.recipient)

      const mixedRouteIsAllV1 = (r: Omit<BaseRoute, 'input' | 'output'>) => {
        return r.pools.every(isV1Pool)
      }
      const mixedRouteIsAllV2 = (r: Omit<BaseRoute, 'input' | 'output'>) => {
        return r.pools.every(isV2Pool)
      }
      const mixedRouteIsAllStable = (r: Omit<BaseRoute, 'input' | 'output'>) => {
        return r.pools.every(isStablePool)
      }

      if (singleHop) {
        /// For single hop, since it isn't really a mixedRoute, we'll just mimic behavior of V1 or V2
        /// We don't use encodeV1Swap() or encodeV2Swap() because casting the trade to a V1Trade or V2Trade is overcomplex
        if (mixedRouteIsAllV1(route)) {
          calldatas = [
            ...calldatas,
            SwapRouter.encodeV1Swap(
              {
                ...trade,
                routes: [route],
                inputAmount,
                outputAmount,
              },
              options,
              routerMustCustody,
              performAggregatedSlippageCheck,
            ),
          ]
        } else if (mixedRouteIsAllV2(route)) {
          calldatas = [
            ...calldatas,
            SwapRouter.encodeV2Swap(
              {
                ...trade,
                routes: [route],
                inputAmount,
                outputAmount,
              },
              options,
              routerMustCustody,
              performAggregatedSlippageCheck,
            ),
          ]
        } else if (mixedRouteIsAllStable(route)) {
          calldatas = [
            ...calldatas,
            SwapRouter.encodeStableSwap(
              {
                ...trade,
                routes: [route],
                inputAmount,
                outputAmount,
              },
              options,
              routerMustCustody,
              performAggregatedSlippageCheck,
            ),
          ]
        } else {
          throw new Error('Unsupported route to encode')
        }
      } else {
        const { pools: sections, output } = partitionMixedRouteByProtocol(route)

        const isLastSectionInRoute = (i: number) => {
          return i === sections.length - 1
        }

        let outputToken
        let inputToken = inputAmount.currency.wrapped

        for (let i = 0; i < sections.length; i++) {
          const section = sections[i]
          const lastSectionInRoute = isLastSectionInRoute(i)

          /// Now, we get output of this section
          outputToken = getOutputOfPools(section, inputToken, output, lastSectionInRoute)

          const newRoute = buildBaseRoute([...section], inputToken, outputToken)

          /// Previous output is now input
          inputToken = outputToken.wrapped

          // By default router holds funds until the last swap, then it is sent to the recipient
          // special case exists where we are unwrapping WETH output, in which case `routerMustCustody` is set to true
          // and router still holds the funds. That logic bundled into how the value of `recipient` is calculated
          const recipientAddress = lastSectionInRoute ? recipient : ADDRESS_THIS
          const inAmount = i === 0 ? amountIn : 0n
          const outAmount = !lastSectionInRoute ? 0n : amountOut
          if (mixedRouteIsAllV1(newRoute)) {
            const path = newRoute.path.map((token) => token.wrapped.address)
            if (isExactIn) {
              const exactInputParams = [
                inAmount, // amountIn
                outAmount, // amountOutMin
                path, // path
                recipientAddress, // to
              ] as const

              calldatas.push(
                encodeFunctionData({
                  abi: SwapRouter.ABI,
                  functionName: 'swapExactTokensForTokensV1',
                  args: exactInputParams,
                }),
              )
            } else {
              const exactOutputParams = [outAmount, inAmount, path, recipientAddress] as const

              calldatas.push(
                encodeFunctionData({
                  abi: SwapRouter.ABI,
                  functionName: 'swapTokensForExactTokensV1',
                  args: exactOutputParams,
                }),
              )
            }
          } else if (mixedRouteIsAllV2(newRoute)) {
            const path = newRoute.path.map((token) => token.wrapped.address)
            if (isExactIn) {
              const exactInputParams = [
                inAmount, // amountIn
                outAmount, // amountOutMin
                path, // path
                recipientAddress, // to
              ] as const

              calldatas.push(
                encodeFunctionData({
                  abi: SwapRouter.ABI,
                  functionName: 'swapExactTokensForTokensV2',
                  args: exactInputParams,
                }),
              )
            } else {
              const exactOutputParams = [outAmount, inAmount, path, recipientAddress] as const

              calldatas.push(
                encodeFunctionData({
                  abi: SwapRouter.ABI,
                  functionName: 'swapTokensForExactTokensV2',
                  args: exactOutputParams,
                }),
              )
            }
          } else if (mixedRouteIsAllStable(newRoute)) {
            const path = newRoute.path.map((token) => token.wrapped.address)
            const pools = route.pools.filter(isStablePool).map((p) => p.address)
            if (isExactIn) {
              const exactInputParams = [
                path, // path
                pools, // stable pools
                inAmount, // amountIn
                outAmount, // amountOutMin
                recipientAddress, // to
              ] as const

              calldatas.push(
                encodeFunctionData({
                  abi: SwapRouter.ABI,
                  functionName: 'exactInputStableSwap',
                  args: exactInputParams,
                }),
              )
            } else {
              const exactOutputParams = [
                path,
                pools,
                outAmount,
                inAmount,
                recipientAddress,
              ] as const

              calldatas.push(
                encodeFunctionData({
                  abi: SwapRouter.ABI,
                  functionName: 'exactOutputStableSwap',
                  args: exactOutputParams,
                }),
              )
            }
          } else {
            throw new Error('Unsupported route')
          }
        }
      }
    }

    return calldatas
  }

  private static encodeSwaps(
    anyTrade: AnyTradeType,
    options: SwapOptions,
    isSwapAndAdd?: boolean,
  ): {
    calldatas: Hex[]
    sampleTrade: SmartRouterTrade<TradeType>
    routerMustCustody: boolean
    inputIsNative: boolean
    outputIsNative: boolean
    totalAmountIn: CurrencyAmount<Currency>
    minimumAmountOut: CurrencyAmount<Currency>
    quoteAmountOut: CurrencyAmount<Currency>
  } {
    const trades = !Array.isArray(anyTrade) ? [anyTrade] : anyTrade

    const numberOfTrades = trades.reduce(
      (numOfTrades, trade) => numOfTrades + trade.routes.length,
      0,
    )

    const sampleTrade = trades[0]

    // All trades should have the same starting/ending currency and trade type
    invariant(
      trades.every((trade) => trade.inputAmount.currency.equals(sampleTrade.inputAmount.currency)),
      'TOKEN_IN_DIFF',
    )
    invariant(
      trades.every((trade) =>
        trade.outputAmount.currency.equals(sampleTrade.outputAmount.currency),
      ),
      'TOKEN_OUT_DIFF',
    )
    invariant(
      trades.every((trade) => trade.tradeType === sampleTrade.tradeType),
      'TRADE_TYPE_DIFF',
    )

    const calldatas: Hex[] = []

    const inputIsNative = sampleTrade.inputAmount.currency.isNative
    const outputIsNative = sampleTrade.outputAmount.currency.isNative

    // flag for whether we want to perform an aggregated slippage check
    //   1. when there are >2 exact input trades. this is only a heuristic,
    //      as it's still more gas-expensive even in this case, but has benefits
    //      in that the reversion probability is lower
    const performAggregatedSlippageCheck =
      sampleTrade.tradeType === TradeType.EXACT_INPUT && numberOfTrades > 2
    // flag for whether funds should be send first to the router
    //   1. when receiving ETH (which much be unwrapped from WETH)
    //   2. when a fee on the output is being taken
    //   3. when performing swap and add
    //   4. when performing an aggregated slippage check
    const routerMustCustody =
      outputIsNative || !!options.fee || !!isSwapAndAdd || performAggregatedSlippageCheck

    // encode permit if necessary
    if (options.inputTokenPermit) {
      invariant(sampleTrade.inputAmount.currency.isToken, 'NON_TOKEN_PERMIT')
      calldatas.push(
        SelfPermit.encodePermit(sampleTrade.inputAmount.currency, options.inputTokenPermit) as Hex,
      )
    }

    for (const trade of trades) {
      if (trade.routes.length === 1 && trade.routes[0].type === RouteType.V1) {
        calldatas.push(
          SwapRouter.encodeV1Swap(
            trade,
            options,
            routerMustCustody,
            performAggregatedSlippageCheck,
          ),
        )
      } else if (trade.routes.length === 1 && trade.routes[0].type === RouteType.V2) {
        calldatas.push(
          SwapRouter.encodeV2Swap(
            trade,
            options,
            routerMustCustody,
            performAggregatedSlippageCheck,
          ),
        )
      } else {
        for (const calldata of SwapRouter.encodeMixedRouteSwap(
          trade,
          options,
          routerMustCustody,
          performAggregatedSlippageCheck,
        )) {
          calldatas.push(calldata)
        }
      }
    }

    const ZERO_IN: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(
      sampleTrade.inputAmount.currency,
      0,
    )
    const ZERO_OUT: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(
      sampleTrade.outputAmount.currency,
      0,
    )

    const minAmountOut: CurrencyAmount<Currency> = trades.reduce(
      (sum, trade) => sum.add(minimumAmountOut(trade, options.slippageTolerance)),
      ZERO_OUT,
    )

    const quoteAmountOut: CurrencyAmount<Currency> = trades.reduce(
      (sum, trade) => sum.add(trade.outputAmount),
      ZERO_OUT,
    )

    const totalAmountIn: CurrencyAmount<Currency> = trades.reduce(
      (sum, trade) => sum.add(maximumAmountIn(trade, options.slippageTolerance)),
      ZERO_IN,
    )

    return {
      calldatas,
      sampleTrade,
      routerMustCustody,
      inputIsNative,
      outputIsNative,
      totalAmountIn,
      minimumAmountOut: minAmountOut,
      quoteAmountOut,
    }
  }

  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trades to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(trades: AnyTradeType, options: SwapOptions): MethodParameters {
    const {
      calldatas,
      sampleTrade,
      routerMustCustody,
      inputIsNative,
      outputIsNative,
      totalAmountIn,
      minimumAmountOut: minAmountOut,
    } = SwapRouter.encodeSwaps(trades, options)

    // unwrap or sweep
    if (routerMustCustody) {
      if (outputIsNative) {
        calldatas.push(
          PaymentsExtended.encodeUnwrapWETH9(minAmountOut.quotient, options.recipient, options.fee),
        )
      } else {
        calldatas.push(
          PaymentsExtended.encodeSweepToken(
            sampleTrade.outputAmount.currency.wrapped,
            minAmountOut.quotient,
            options.recipient,
            options.fee,
          ),
        )
      }
    }

    // must refund when paying in ETH: either with an uncertain input amount OR if there's a chance of a partial fill.
    // unlike ERC20's, the full ETH value must be sent in the transaction, so the rest must be refunded.
    if (inputIsNative && sampleTrade.tradeType === TradeType.EXACT_OUTPUT) {
      calldatas.push(Payments.encodeRefundETH() as Hex)
    }

    return {
      calldata: MulticallExtended.encodeMulticall(calldatas, options.deadlineOrPreviousBlockhash),
      value: numberToHex(inputIsNative ? totalAmountIn.quotient : ZERO),
    }
  }

  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trades to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapAndAddCallParameters(
    trades: AnyTradeType,
    options: SwapAndAddOptions,
  ): MethodParameters {
    const {
      calldatas,
      inputIsNative,
      outputIsNative,
      totalAmountIn: totalAmountSwapped,
      quoteAmountOut,
    } = SwapRouter.encodeSwaps(trades, options, true)

    // encode output token permit if necessary
    if (options.outputTokenPermit) {
      invariant(quoteAmountOut.currency.isToken, 'NON_TOKEN_PERMIT_OUTPUT')
      calldatas.push(
        SelfPermit.encodePermit(quoteAmountOut.currency, options.outputTokenPermit) as Hex,
      )
    }

    // sweep remaining tokens
    if (inputIsNative) {
      calldatas.push(PaymentsExtended.encodeUnwrapWETH9(ZERO))
    }
    if (outputIsNative) {
      calldatas.push(PaymentsExtended.encodeUnwrapWETH9(ZERO))
    }

    let value: bigint
    if (inputIsNative) {
      value = totalAmountSwapped.wrapped.quotient
    } else {
      value = ZERO
    }

    return {
      calldata: MulticallExtended.encodeMulticall(calldatas, options.deadlineOrPreviousBlockhash),
      value: numberToHex(value),
    }
  }
}

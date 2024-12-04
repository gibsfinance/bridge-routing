import { derived, writable } from 'svelte/store'
import * as input from '$lib/stores/input'
import {
  zeroAddress,
  type Hex,
  formatUnits,
  parseUnits,
  isAddress,
  encodeAbiParameters,
  concatHex,
  encodeFunctionData,
  getAddress,
  getContract,
  erc20Abi,
} from 'viem'
import { walletAccount } from './auth/store'
import { Chains, toChain } from './auth/types'
import { loading, type Cleanup } from './loading'
import type { Token, TokenOut } from '../types'
import * as chainEvents from './chain-events'
import { chainsMetadata } from './auth/constants'
import { multicallErc20, multicallRead, type Erc20Metadata } from '$lib/utils'
import noop from 'lodash/noop'
import flatMap from 'lodash/flatMap'
import isString from 'lodash/isString'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'
import sortBy from 'lodash/sortBy'
import { uniV2Routers, nativeAssetOut, whitelisted, pathway } from './config'
import * as abis from './abis'
import * as imageLinks from './image-links'
import { isZero, stripNonNumber } from './utils'
import { settings } from './fee-manager'

const backupAssetIn = {
  address: zeroAddress,
  name: 'unknown',
  symbol: 'xxx',
  decimals: 18,
  logoURI: '',
  chainId: 369,
} as Token

/** the asset coming out on the other side of the bridge (foreign) */
export const assetOut = derived(
  [input.bridgeKey, input.assetIn, chainEvents.assetLink],
  ([$bridgeKey, $assetIn, assetLink], set) => {
    if (!$bridgeKey || !$assetIn) {
      set(null)
      return noop
    }
    const toChainId = $bridgeKey[2]
    const assetIn = {
      ...$assetIn,
      address:
        $assetIn.address === zeroAddress
          ? nativeAssetOut[$bridgeKey[1]]
          : getAddress($assetIn.address),
    }
    // if there is no asset link, then the token is native and has not yet been bridged
    if (!assetLink) {
      set(null)
      return noop
    }
    const { assetOutAddress } = assetLink
    if (!assetOutAddress) {
      set({
        address: null,
        decimals: $assetIn.decimals,
        chainId: $assetIn.chainId,
        name: `${$assetIn.name} from Pulsechain`,
        symbol: `w${$assetIn.symbol}`,
        extensions: {
          bridgeInfo: {
            [$assetIn.chainId]: {
              tokenAddress: $assetIn.address,
            },
          },
        },
      })
      return noop
    }
    const client = input.clientFromChain(toChainId)
    set(null)
    return loading.loadsAfterTick(
      'assetout',
      async () => {
        const contract = getContract({
          address: assetOutAddress,
          abi: erc20Abi,
          client,
        })
        return contract.read.totalSupply().catch(() => {
          return -1n
        })
      },
      async (data: bigint, cleanup: Cleanup) => {
        // console.log('fetching asset out', data)
        if (data < 0n) {
          cleanup()
          return null
        }
        return await multicallErc20({
          client: input.clientFromChain(toChainId),
          chain: chainsMetadata[toChainId],
          target: assetOutAddress,
        }).catch(() => null)
      },
      (r: Erc20Metadata | null) => {
        const result = r as Erc20Metadata | null
        let res = backupAssetIn
        if (result) {
          const [name, symbol, decimals] = result
          res = {
            name,
            symbol,
            decimals,
            chainId: Number(toChainId),
            address: assetOutAddress,
          } as Token
          res.logoURI = imageLinks.image(res)
        } else {
          // assumptions
          res = {
            ...assetIn,
            chainId: Number(toChainId),
            address: zeroAddress,
            name: `${assetIn.name} from Pulsechain`,
            symbol: `w${assetIn.symbol}`,
          } as Token
        }
        return res
      },
      set,
    )
  },
  null as TokenOut | null,
)

export const networkSwitchAssetOutAddress = derived(
  [input.toChainId, assetOut, input.unwrap],
  ([$toChainId, $assetOut, $unwrap]) => {
    if (!$assetOut) return null
    if (!$unwrap) return $assetOut.address
    return nativeAssetOut[$toChainId] === $assetOut.address ? zeroAddress : $assetOut.address
  },
)

/** this value represents the balance on of the asset going into the bridge */
export const fromTokenBalance = chainEvents.watchTokenBalance(
  input.fromChainId,
  input.assetIn,
  chainEvents.origination.block,
)
/** this value represents the balance of the asset coming out on the other side of the bridge */
export const toTokenBalance = chainEvents.watchTokenBalance(
  input.toChainId,
  assetOut,
  chainEvents.destination.block,
  true,
)

export const unwrap = derived(
  [input.unwrap, input.canChangeUnwrap],
  ([$unwrapSetting, $canChangeUnwrap]) => {
    return $canChangeUnwrap && $unwrapSetting
  },
)

export const oneEther = 10n ** 18n

export const desiredExcessCompensationBasisPoints = derived(
  [input.assetIn, input.feeType, whitelisted, input.bridgeKey],
  ([$assetIn, $feeType, $whitelisted, $bridgeKey]) => {
    const $pathway = pathway($bridgeKey)
    if (!$pathway?.requiresDelivery) {
      return 0n
    }
    return !$assetIn
      ? 0n
      : $feeType === input.FeeType.PERCENT
        ? 1_000n
        : input.isNative($assetIn, $bridgeKey)
          ? 1_000n
          : $whitelisted.has(getAddress($assetIn.address))
            ? 5_000n
            : 10_000n
  },
)

export const desiredCompensationRatio = derived(
  [desiredExcessCompensationBasisPoints],
  ([$desiredExcessCompensationBasisPoints]) => {
    return oneEther + ($desiredExcessCompensationBasisPoints * oneEther) / 10_000n
  },
)

export const desiredExcessCompensationPercentage = derived(
  [desiredExcessCompensationBasisPoints],
  ([$desiredExcessCompensationBasisPoints]) =>
    formatUnits($desiredExcessCompensationBasisPoints, 2),
)

const oneTokenInt = derived([input.assetIn], ([$assetIn]) =>
  $assetIn ? 10n ** BigInt($assetIn.decimals) : 1n,
)

type FetchResult = bigint[] | Hex
const fetchCache = new Map<
  string,
  {
    time: number
    result: Promise<FetchResult[]>
  }
>()
setInterval(() => {
  const now = Date.now()
  for (const [k, cached] of fetchCache.entries()) {
    if (cached.time + 10_000 < now) {
      fetchCache.delete(k)
    }
  }
}, 3_000)

/**
 * check the prices that each router offers for the given paths
 * @param assetInAddress the address of the asset going into the bridge
 * @param oneTokenInt the number of tokens to push into the bridge (before fees)
 * @param chain the chain of the asset going into the bridge
 * @param bridgeKey the bridge key
 * @param blockNumber the block number to use for the price
 * @param paths the paths to check
 * @returns the prices as bigint for each path, hex whenever the price is not available
 */
const readAmountOut = (
  $assetInAddress: Hex,
  $oneTokenInt: bigint,
  chain: Chains,
  $bridgeKey: input.BridgeKey,
  blockNumber: bigint,
  paths: Hex[][],
): Promise<FetchResult[]> => {
  const key = `${chain}-${$bridgeKey}-${blockNumber}-${$assetInAddress}-${$oneTokenInt}`
  const res = fetchCache.get(key)
  if (res) {
    return res.result
  }
  const q = multicallRead<FetchResult[]>({
    chain: chainsMetadata[chain],
    client: input.clientFromChain(chain),
    abi: abis.univ2Router,
    // pulsex router
    calls: flatMap(uniV2Routers[chain], (target) =>
      paths.map((path) => ({
        functionName: 'getAmountsOut',
        allowFailure: true,
        args: [$oneTokenInt, path],
        target,
      })),
    ),
  })
  fetchCache.set(key, {
    time: Date.now(),
    result: q,
  })
  return q
}
/** the number of tokens to push into the bridge (before fees) */
export const amountToBridge = derived(
  [input.amountIn, input.assetIn, input.bridgeKey], //
  ([$amountIn, $assetIn]) => {
    if (isZero($amountIn) || !$assetIn) return 0n
    return parseUnits(stripNonNumber($amountIn), $assetIn.decimals)
  },
)
export const priceCorrective = derived(
  [
    input.bridgeKey,
    oneTokenInt,
    chainEvents.assetLink,
    assetOut,
    amountToBridge,
    chainEvents.destination.block,
  ],
  ([$bridgeKey, $oneTokenInt, $assetLink, $assetOut, $amountToBridge, $block], set) => {
    if (!$assetLink?.assetOutAddress || !$assetOut || !$assetOut.address) {
      set(oneEther)
      return
    }
    // the max fee i am targeting is 10%
    let amountToBridge = $amountToBridge / 10n
    if (amountToBridge === 0n) {
      amountToBridge = parseUnits('10', $assetOut.decimals)
    }
    const outputFromRouter = (result: FetchResult) => {
      if (isString(result)) {
        return 0n
      }
      if (!result.length) {
        return 0n
      }
      const last = result[result.length - 1]
      return (last * $oneTokenInt) / amountToBridge
    }
    const [, fromChain, toChain] = $bridgeKey
    // const destinationToken = nativeAssetOut[fromChain]
    // measure the amount of the destination token that needs to be used to cover the cost of the bridge
    const measurementToken = nativeAssetOut[toChain]
    if (!pathway($bridgeKey)?.requiresDelivery) {
      set(oneEther)
      return
    }
    // signal that the price corrective cannot be calculated yet
    set(0n)
    return loading.loadsAfterTick(
      'gas',
      async () =>
        // fetch the token bridge info for the token that is about to be spent by the delivery service
        await chainEvents.tokenBridgeInfo([
          input.flipBridgeKey($bridgeKey),
          {
            ...$assetOut,
            address: measurementToken,
          },
        ]),
      async (paymentTokenResult: chainEvents.TokenBridgeInfo) => {
        // for a bridge going from foreign to home,
        // use the destination token as the measurement token for the home side
        const homeBridgedPaymentToken = paymentTokenResult!.assetOutAddress!
        return await Promise.all([
          readAmountOut(
            $assetLink.assetInAddress,
            amountToBridge,
            fromChain,
            $bridgeKey,
            $block!.number!,
            [
              // check the direct route
              [$assetLink.assetInAddress, homeBridgedPaymentToken],
              // might have heavier liquidity going through the native asset on the home side
              [$assetLink.assetInAddress, nativeAssetOut[fromChain], homeBridgedPaymentToken],
            ],
          ),
          readAmountOut(
            $assetOut.address!, //
            amountToBridge,
            toChain, //
            $bridgeKey, //
            $block!.number!,
            // only the direct route is available.
            // might be able to create a whitelist for this at some point
            [[$assetOut!.address!, measurementToken]],
          ),
        ])
      },
      (results: [FetchResult[], FetchResult[]]) => {
        const max = (amountsOut: (bigint | undefined)[]) => {
          return compact(amountsOut).reduce((max, current) => (max < current ? current : max), 0n)
        }
        const [outputs, inputs] = results
        const outputAmounts = outputs.map(outputFromRouter)
        const inputAmounts = inputs.map(outputFromRouter)
        const outputToken = max(outputAmounts)
        const inputToken = max(inputAmounts)
        return outputToken && outputToken > 0n
          ? inputToken && inputToken > outputToken && inputToken / outputToken === 1n
            ? inputToken
            : outputToken
          : inputToken
      },
      set,
    )
  },
  oneEther,
)

/**
 * the oneTokenInt, estimated cost for running a transaction
 * on the foreign network, given current gas conditions
 */
export const estimatedNetworkCost = derived(
  [
    input.bridgePathway,
    input.estimatedGas,
    chainEvents.destination.latestBaseFeePerGas,
    priceCorrective,
    oneTokenInt,
  ],
  ([$bridgePathway, $estimatedGas, $latestBaseFeePerGas, $priceCorrective, $oneTokenInt]) => {
    if (!$priceCorrective || !$bridgePathway?.requiresDelivery) {
      return 0n
    }
    return ($estimatedGas * $latestBaseFeePerGas * $oneTokenInt) / $priceCorrective
  },
)
/** the maximum number of tokens that the user wishes to pay in fees */
export const limit = derived([input.limit, input.assetIn], ([$limit, $assetIn]) => {
  if (isZero($limit) || !$assetIn) return 0n
  return parseUnits(stripNonNumber($limit), $assetIn.decimals)
})
export const fee = derived([input.fee, input.bridgePathway], ([$fee, $bridgePathway]) => {
  if (isZero($fee) || !$bridgePathway || !$bridgePathway.requiresDelivery) return 0n
  return parseUnits(stripNonNumber($fee), 18) / 100n
})

export const bridgeFee = derived([input.bridgeKey, input.bridgeFee], ([$bridgeKey]) => {
  const setting = settings.get($bridgeKey)
  const path = pathway($bridgeKey)
  return (path?.toHome ? setting?.feeF2H : setting?.feeH2F) || 0n
})

/** the number of tokens charged as fee for crossing the bridge */
export const bridgeCost = derived(
  [amountToBridge, bridgeFee],
  ([$amountToBridge, $bridgeFee]) => ($amountToBridge * $bridgeFee) / oneEther,
)
/** the number of tokens available after they have crossed the bridge */
export const amountAfterBridgeFee = derived(
  [amountToBridge, bridgeCost],
  ([$amountToBridge, $bridgeCost]) => {
    const afterFee = $amountToBridge - $bridgeCost
    if (afterFee < 0n) return 0n
    return afterFee
  },
)

export const limitFromPercent = derived(
  [fee, amountAfterBridgeFee],
  ([$fee, $amountAfterBridgeFee]) => {
    return ($amountAfterBridgeFee * $fee) / oneEther
  },
)

/** the estimated network cost + tip */
export const baseFeeReimbersement = derived(
  [estimatedNetworkCost, fee],
  ([$estimatedNetworkCost, $fee]) => {
    return ($estimatedNetworkCost * (oneEther + $fee)) / oneEther
  },
  0n,
)
/** the fee, clamped to the user defined limit */
export const clampedReimbersement = derived(
  [baseFeeReimbersement, limit, input.feeType, limitFromPercent],
  ([$baseFeeReimbersement, $limit, $feeType, $limitFromPercent]) => {
    if ($feeType === input.FeeType.PERCENT) {
      return $limitFromPercent
    }
    return $baseFeeReimbersement > $limit ? $limit : $baseFeeReimbersement
  },
)
/** the estimated cost given the choice for a fixed fee, limit and incentive fee */
export const estimatedCost = derived(
  [input.feeType, limit, limitFromPercent, clampedReimbersement, input.shouldDeliver],
  ([$feeType, $limit, $limitFromPercent, $clampedReimbersement, $shouldDeliver]) => {
    if (!$shouldDeliver) return 0n
    if ($feeType === input.FeeType.PERCENT) {
      return $limitFromPercent
    }
    if ($feeType === input.FeeType.FIXED) {
      return $limit
    }
    return $clampedReimbersement
  },
)
/** creates the settings param for the fee director struct */
export const feeTypeSettings = derived([input.feeType, unwrap], ([$feeType, $unwrap]) => {
  const th0 = $feeType === input.FeeType.FIXED ? 1n : 0n
  const st1 = $unwrap ? 1n : 0n
  const nd2 = 1n // always exclude priority when you can
  const rd3 = $feeType === input.FeeType.PERCENT ? 1n : 0n
  return (rd3 << 3n) | (nd2 << 2n) | (st1 << 1n) | th0
})

/** the encoded struct to be passed to the foreign router */
export const feeDirectorStructEncoded = derived(
  [
    input.bridgePathway,
    input.recipient,
    feeTypeSettings,
    limit,
    fee,
    input.feeType,
    assetOut,
    priceCorrective,
  ],
  ([
    $bridgePathway,
    $recipient,
    $feeTypeSettings,
    $limit,
    $fee,
    $feeType,
    $assetOut,
    $priceCorrective,
  ]) => {
    if (!$assetOut || !$bridgePathway) {
      return null
    }
    let multiplier = 0n
    if ($feeType === input.FeeType.GAS_TIP && $priceCorrective > 0n) {
      multiplier = ((oneEther + $fee) * 10n ** BigInt($assetOut.decimals)) / $priceCorrective
    } else if ($feeType === input.FeeType.PERCENT) {
      multiplier = $fee
    }
    if (!isAddress($recipient)) {
      return null
    }
    return encodeAbiParameters(abis.feeDeliveryStruct, [
      [$recipient, $feeTypeSettings, $limit, multiplier],
    ])
  },
)

export const interactingWithBridgeToken = derived(
  [input.assetIn, chainEvents.assetLink],
  ([$assetIn, $assetLink]) => {
    const { toForeign, toHome } = $assetLink || {}
    const { foreign } = toForeign || {}
    const { home } = toHome || {}
    let assetInAddress = $assetIn?.address
    if (!assetInAddress) return false
    assetInAddress = getAddress(assetInAddress)
    return !!(
      (foreign && getAddress(foreign) === assetInAddress) ||
      (home && getAddress(home) === assetInAddress)
    )
  },
)
/**
 * the full calldata defined in the home bridge's _data prop
 * to be used to call on the foreign router
 */
export const foreignDataParam = derived(
  [
    input.bridgePathway,
    input.assetIn,
    chainEvents.assetLink,
    input.destinationRouter,
    feeDirectorStructEncoded,
    input.recipient,
    input.shouldDeliver,
  ],
  ([
    $bridgePathway,
    $assetIn,
    $assetLink,
    $destinationRouter,
    $feeDirectorStructEncoded,
    $recipient,
    $shouldDeliver,
  ]) => {
    if (!$bridgePathway || !$assetIn) {
      return null
    }
    if (!$destinationRouter || !$feeDirectorStructEncoded || !$assetLink) {
      return null
    }
    if ($bridgePathway.requiresDelivery && !$shouldDeliver) {
      return $recipient
    }
    return concatHex([$destinationRouter, $feeDirectorStructEncoded])
  },
)
// export const foreignCalldata = derived(
//   [assetOut, input.shouldDeliver, amountAfterBridgeFee, feeDirectorStructEncoded],
//   ([$assetOut, $shouldDeliver, $amountAfterBridgeFee, $feeDirectorStructEncoded]) => {
//     if (!$feeDirectorStructEncoded || !$assetOut) {
//       return null
//     }
//     if (!$shouldDeliver) {
//       return '0x' as Hex
//     }
//     return encodeFunctionData({
//       abi: abis.outputRouter,
//       functionName: 'onTokenBridged',
//       args: [$assetOut.address, $amountAfterBridgeFee, $feeDirectorStructEncoded],
//     })
//   },
// )

/**
 * the inputs to the transaction that will be signed over by the user's wallet
 * this transaction transfers to the relevant bridge address and the user's amount that they wish to bridge before fees
 * it also contains calldata that is shuttled over to the foreign network
 * to be executed there after validator signatures are provided
 */
export const transactionInputs = derived(
  [
    walletAccount,
    input.recipient,
    input.assetIn,
    input.destinationRouter,
    input.shouldDeliver,
    chainEvents.assetLink,
    input.bridgePathway,
    amountToBridge,
    foreignDataParam,
    feeDirectorStructEncoded,
    interactingWithBridgeToken,
  ],
  ([
    $walletAccount,
    $recipient,
    $assetIn,
    $destinationRouter,
    $shouldDeliver,
    $assetLink,
    $bridgePathway,
    $amountToBridge,
    $foreignDataParam,
    $feeDirectorStructEncoded,
    $interactingWithBridgeToken,
  ]) => {
    // check that path / bridge key is valid
    if (!$bridgePathway) return null
    // check that recipient is valid
    if (!$recipient || !isAddress($recipient)) return null
    // check that wallet account is valid
    if (!$walletAccount || !isAddress($walletAccount)) return null
    // check that asset in is valid
    if (!$assetIn) return null
    // check that asset link is valid
    if (!$assetLink) return null
    let value = 0n
    // we are moving "from" this side, so we need to call a function on the "from" address
    // only relevant for the relayTokens(AndCall) pathway outside of native tokens
    let toAddress = $bridgePathway.from
    let data = '0x' as Hex
    if ($interactingWithBridgeToken) {
      // when interacting with a bridged token, we need to call the token address directly
      toAddress = $assetIn.address
      value = 0n
      // if we want delivery of the tokens (going from home to foreign) then we need to have the foreign data param
      // and it needs to start with the destination router
      if (!$foreignDataParam) return null
      data = $bridgePathway.usesExtraParam
        ? encodeFunctionData({
            abi: abis.erc677ExtraInput,
            functionName: 'transferAndCall',
            args: [$bridgePathway.from, $amountToBridge, $foreignDataParam, $walletAccount],
          })
        : encodeFunctionData({
            abi: abis.erc677,
            functionName: 'transferAndCall',
            args: [$bridgePathway.from, $amountToBridge, $foreignDataParam],
          })
    } else if ($assetIn.address === zeroAddress) {
      value = $amountToBridge
      toAddress = $bridgePathway.nativeRouter
      if ($bridgePathway.feeManager === 'from' && $shouldDeliver) {
        // transferring native to foreign
        if (!$feeDirectorStructEncoded) return null
        if (!$destinationRouter) return null
        data = $bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.nativeRouterExtraInput,
              functionName: 'relayTokensAndCall',
              args: [$destinationRouter, $feeDirectorStructEncoded, $walletAccount],
            })
          : encodeFunctionData({
              abi: abis.nativeRouter,
              functionName: 'relayTokensAndCall',
              args: [$destinationRouter, $feeDirectorStructEncoded],
            })
      } else {
        // delivery always occurs when moving from foreign to home
        data = $bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.nativeRouterExtraInput,
              functionName: 'wrapAndRelayTokens',
              args: [$recipient, $walletAccount],
            })
          : encodeFunctionData({
              abi: abis.nativeRouter,
              functionName: 'wrapAndRelayTokens',
              args: [$recipient],
            })
      }
    } else {
      // tokens native to this side, entering the bridge
      if ($shouldDeliver && $bridgePathway.requiresDelivery) {
        if (!$feeDirectorStructEncoded) return null
        if (!$destinationRouter) return null
        data = $bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.inputBridgeExtraInput,
              functionName: 'relayTokensAndCall',
              args: [
                $assetIn.address,
                $destinationRouter,
                $amountToBridge,
                $feeDirectorStructEncoded,
                $walletAccount,
              ],
            })
          : encodeFunctionData({
              abi: abis.inputBridge,
              functionName: 'relayTokensAndCall',
              args: [
                $assetIn.address,
                $destinationRouter,
                $amountToBridge,
                $feeDirectorStructEncoded,
              ],
            })
      } else {
        data = $bridgePathway.usesExtraParam
          ? encodeFunctionData({
              abi: abis.inputBridgeExtraInput,
              functionName: 'relayTokens',
              args: [$assetIn.address, $recipient, $amountToBridge, $walletAccount],
            })
          : encodeFunctionData({
              abi: abis.inputBridge,
              functionName: 'relayTokens',
              args: [$assetIn.address, $recipient, $amountToBridge],
            })
      }
    }
    return {
      to: toAddress,
      value,
      data,
    }
  },
)

/** the sources of the asset, including the wrapped asset if it exists */
export const assetSources = (asset: Token | null) => {
  if (!asset) {
    return ''
  }
  type MinTokenInfo = Pick<Token, 'chainId' | 'address'>
  const { chainId, address, extensions } = asset
  const inputs = compact(
    flatten([
      { chainId, address },
      extensions?.wrapped ? { chainId, address: extensions.wrapped.address } : null,
      ...Object.entries(extensions?.bridgeInfo || {}).map(([chainId, info]) => {
        if (!info.tokenAddress) {
          return null
        }
        const otherSide = [
          {
            chainId: Number(chainId),
            address: info.tokenAddress,
          },
        ]
        if (address === nativeAssetOut[toChain(asset.chainId)]) {
          otherSide.push({
            chainId: asset.chainId,
            address: zeroAddress,
          })
        }
        if (info.tokenAddress === nativeAssetOut[toChain(+chainId)]) {
          otherSide.push({
            chainId: Number(chainId),
            address: zeroAddress,
          })
        }
        return otherSide
      }),
    ]),
  )
  const sources = sortBy(inputs, [(a: MinTokenInfo) => a.chainId]).map(
    (a: MinTokenInfo) => `${a.chainId}/${a.address}`,
  )
  return imageLinks.images(sources)
}

export const details = writable<null | 'settings' | 'details'>(null)

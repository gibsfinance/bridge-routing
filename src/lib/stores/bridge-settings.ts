import { derived } from 'svelte/store'
import * as input from '$lib/stores/input'
import { derived as asyncDerived } from './async'
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
} from 'viem'
import { walletAccount } from './auth/store'
import { Chains } from './auth/types'
import { loading } from './loading'
import type { Token } from '../types'
import * as chainEvents from './chain-events'
import { chainsMetadata } from './auth/constants'
import { multicallErc20, multicallRead } from '$lib/utils'
import _ from 'lodash'
import { uniV2Routers, defaultAssetIn, nativeAssetOut, whitelisted, pathway } from './config'
import * as abis from './abis'
import * as imageLinks from './image-links'
import { isZero, stripNonNumber } from './utils'
import { latestBaseFeePerGas } from './chain-events'
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
export const assetOut = asyncDerived(
  [input.bridgeKey, input.assetIn, chainEvents.assetLink],
  async ([$bridgeKey, $assetIn, assetLink]) => {
    if (!$bridgeKey || !$assetIn) {
      return null
    }
    const toChainId = $bridgeKey[2]
    const assetIn = {
      ...$assetIn,
      address: $assetIn.address === zeroAddress ? nativeAssetOut[$bridgeKey[1]] : getAddress($assetIn.address),
    }
    if (!assetLink) {
      return null
    }
    const { toHome, toForeign } = assetLink
    let res = backupAssetIn
    const foreign = toHome?.foreign || toForeign?.foreign
    if (foreign && foreign !== zeroAddress) {
      loading.increment('balance')
      const r = await multicallErc20({
        client: input.clientFromChain(toChainId),
        chain: chainsMetadata[toChainId],
        target: foreign,
      }).catch(() => null)
      if (r) {
        const [name, symbol, decimals] = r
        res = {
          name,
          symbol,
          decimals,
          chainId: Number(toChainId),
          address: foreign,
        } as Token
        res.logoURI = imageLinks.image(res)
      } else {
        // assumptions
        res = {
          ...assetIn,
          chainId: Number($bridgeKey[2]),
          address: zeroAddress,
          name: `${assetIn.name} from Pulsechain`,
          symbol: `w${assetIn.symbol}`,
        } as Token
      }
    }
    loading.decrement('balance')
    return res
  },
  null,
)

/** this value represents the balance on of the asset going into the bridge */
export const fromTokenBalance = chainEvents.watchTokenBalance(input.fromChainId, input.assetIn)
/** this value represents the balance of the asset coming out on the other side of the bridge */
export const toTokenBalance = chainEvents.watchTokenBalance(input.toChainId, assetOut)

export const unwrap = derived([input.unwrap, input.canChangeUnwrap], ([$unwrapSetting, $canChangeUnwrap]) => {
  return $canChangeUnwrap && $unwrapSetting
})

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
  ([$desiredExcessCompensationBasisPoints]) => formatUnits($desiredExcessCompensationBasisPoints, 2),
)

const oneTokenInt = derived([input.assetIn], ([$assetIn]) => ($assetIn ? 10n ** BigInt($assetIn.decimals) : 1n))

let priceCorrectiveGuard = {}
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
    if (cached.time + 20_000 < now) {
      fetchCache.delete(k)
    }
  }
}, 5_000)
const readAmountOut = (
  {
    $oneTokenInt,
    $assetInAddress,
    chain,
    $bridgeKey,
  }: {
    $oneTokenInt: bigint
    $assetInAddress: Hex
    chain: Chains
    $bridgeKey: input.BridgeKey
  },
  baseFee: bigint,
  paths: Hex[][],
): Promise<FetchResult[]> => {
  const key = `${chain}-${$bridgeKey}-${baseFee}-${$assetInAddress}-${$oneTokenInt}`
  const res = fetchCache.get(key)
  if (res) {
    return res.result
  }
  const q = multicallRead<FetchResult[]>({
    chain: chainsMetadata[chain],
    client: input.clientFromChain(chain),
    abi: abis.univ2Router,
    // pulsex router
    calls: _.flatMap(uniV2Routers[chain], (target) =>
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
  [input.assetIn, input.bridgeKey, oneTokenInt, assetOut, amountToBridge, latestBaseFeePerGas, input.flippedBridgeKey],
  ([$assetIn, $bridgeKey, $oneTokenInt, $assetOut, $amountToBridge, $latestBaseFeePerGas, $flippedBridgeKey], set) => {
    // check if recognized as wrapped
    // if recognized as wrapped, use oneEther
    let cancelled = false
    priceCorrectiveGuard = {}
    const pcg = priceCorrectiveGuard
    if (!$assetIn) {
      set(0n)
      return
    }
    if (!$assetOut || input.isNative($assetOut, $bridgeKey)) {
      set(oneEther)
      return
    }
    // the max fee i am targeting is 10%
    let amountToBridge = $amountToBridge / 10n
    if (amountToBridge === 0n) {
      amountToBridge = parseUnits('10', $assetOut.decimals)
    }
    const outputFromRouter = (result: FetchResult) => {
      if (cancelled || priceCorrectiveGuard !== pcg) {
        return 0n
      }
      if (_.isString(result)) {
        return 0n
      }
      if (!result.length) {
        return 0n
      }
      const last = result[result.length - 1]
      return (last * $oneTokenInt) / amountToBridge
    }
    const [, fromChain, toChain] = $bridgeKey
    const paymentToken = nativeAssetOut[toChain]
    const assetInAddress = $assetIn.address === zeroAddress ? nativeAssetOut[fromChain] : $assetIn.address
    loading.increment('gas')
    const cleanup = () => {
      if (cancelled) return
      cancelled = true
      loading.decrement('gas')
    }
    chainEvents
      .tokenBridgeInfo([
        $flippedBridgeKey,
        {
          ...$assetOut,
          address: paymentToken,
        },
      ])
      .then((result) => {
        const reversePairing = result?.toHome || result?.toForeign
        const paymentTokenFromBridgeStart =
          reversePairing?.foreign === zeroAddress ? reversePairing?.home : reversePairing?.foreign
        return Promise.all([
          readAmountOut(
            {
              $assetInAddress: $assetIn.address,
              $oneTokenInt: amountToBridge,
              chain: fromChain,
              $bridgeKey,
            },
            $latestBaseFeePerGas,
            [[assetInAddress, paymentTokenFromBridgeStart!]],
          ),
          readAmountOut(
            {
              $assetInAddress: $assetOut.address,
              $oneTokenInt: amountToBridge,
              chain: toChain,
              $bridgeKey,
            },
            $latestBaseFeePerGas,
            [[$assetOut!.address, paymentToken]],
          ),
        ])
      })
      .then((results) => {
        if (cancelled) return
        const max = (amountsOut: (bigint | undefined)[]) => {
          return _(amountsOut)
            .compact()
            .reduce((max, current) => (max < current ? current : max), 0n)
        }
        const [outputs, inputs] = results
        const outputAmounts = outputs.map(outputFromRouter)
        const inputAmounts = inputs.map(outputFromRouter)
        const outputToken = max(outputAmounts)
        const inputToken = max(inputAmounts)
        const res =
          outputToken && outputToken > 0n
            ? inputToken && inputToken > outputToken && inputToken / outputToken === 1n
              ? inputToken
              : outputToken
            : inputToken
        set(res || 0n)
      })
      .catch(console.error)
      .then(cleanup)
    return cleanup
  },
  oneEther,
)

/**
 * the oneTokenInt, estimated cost for running a transaction
 * on the foreign network, given current gas conditions
 */
export const estimatedNetworkCost = derived(
  [input.bridgePathway, input.estimatedGas, latestBaseFeePerGas, priceCorrective, oneTokenInt],
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
export const amountAfterBridgeFee = derived([amountToBridge, bridgeCost], ([$amountToBridge, $bridgeCost]) => {
  const afterFee = $amountToBridge - $bridgeCost
  if (afterFee < 0n) return 0n
  return afterFee
})

export const limitFromPercent = derived([fee, amountAfterBridgeFee], ([$fee, $amountAfterBridgeFee]) => {
  return ($amountAfterBridgeFee * $fee) / oneEther
})

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
  [input.feeType, limit, limitFromPercent, clampedReimbersement],
  ([$feeType, $limit, $limitFromPercent, $clampedReimbersement]) => {
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
  [input.recipient, feeTypeSettings, limit, fee, input.feeType, assetOut, priceCorrective],
  ([$recipient, $feeTypeSettings, $limit, $fee, $feeType, $assetOut, $priceCorrective]) => {
    if (!$assetOut) {
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
    return encodeAbiParameters(abis.feeDeliveryStruct, [[$recipient, $feeTypeSettings, $limit, multiplier]])
  },
)
/**
 * the full calldata defined in the home bridge's _data prop
 * to be used to call on the foreign router
 */
export const foreignDataParam = derived(
  [chainEvents.assetLink, input.router, feeDirectorStructEncoded],
  ([$assetLink, $router, $feeDirectorStructEncoded]) => {
    return !$feeDirectorStructEncoded || !$assetLink
      ? null
      : $assetLink.toForeign
        ? $feeDirectorStructEncoded
        : concatHex([$router, $feeDirectorStructEncoded])
  },
)
export const foreignCalldata = derived(
  [assetOut, amountAfterBridgeFee, feeDirectorStructEncoded],
  ([$assetOut, $amountAfterBridgeFee, $feeDirectorStructEncoded]) => {
    if (!$feeDirectorStructEncoded || !$assetOut) {
      return null
    }
    return encodeFunctionData({
      abi: abis.outputRouter,
      functionName: 'onTokenBridged',
      args: [$assetOut.address, $amountAfterBridgeFee, $feeDirectorStructEncoded],
    })
  },
)

/**
 * the calldata that will be signed over by the user's wallet
 * this calldata transfers to the bridge address and the user's amount that they wish to bridge before fees
 * it also contains calldata that is shuttled over to the foreign network
 * to be executed there after validator signatures are provided
 */
export const calldata = derived(
  [input.bridgeKey, amountToBridge, foreignDataParam, walletAccount],
  ([$bridgeKey, $amountToBridge, $foreignDataParam, $walletAccount]) => {
    if (!$foreignDataParam) return null
    const path = pathway($bridgeKey)
    if (!path) return null
    const destination = path.to
    return path.usesExtraParam
      ? encodeFunctionData({
          abi: abis.erc677ExtraInput,
          functionName: 'transferAndCall',
          args: [destination, $amountToBridge, $foreignDataParam, $walletAccount || zeroAddress],
        })
      : encodeFunctionData({
          abi: abis.erc677,
          functionName: 'transferAndCall',
          args: [destination, $amountToBridge, $foreignDataParam],
        })
  },
)

export const assetSources = (asset: Token | null) => {
  if (!asset) {
    return ''
  }
  type MinTokenInfo = Pick<Token, 'chainId' | 'address'>
  const sources = _([
    {
      chainId: asset.chainId,
      address: asset.address,
    },
    ...Object.entries(asset.extensions?.bridgeInfo || {}).map(([chainId, info]) => {
      if (!info.tokenAddress) {
        return null
      }
      return {
        chainId: Number(chainId),
        address: info.tokenAddress,
      }
    }),
  ])
    .compact()
    .sortBy([(a: MinTokenInfo) => a.chainId])
    .map((a: MinTokenInfo) => `${a.chainId}/${a.address}`)
    .value()
  return imageLinks.images(sources)
}

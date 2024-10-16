import { derived, get, type Readable } from 'svelte/store'
import * as input from '$lib/stores/input'
import { derived as asyncDerived } from './async'
import {
  zeroAddress,
  type Hex,
  type PublicClient,
  getContract,
  erc20Abi,
  formatUnits,
  parseUnits,
  isAddress,
  encodeAbiParameters,
  concatHex,
  encodeFunctionData,
  getAddress,
} from 'viem'
import { walletAccount } from './auth/store'
import { Chains, type DestinationChains } from './auth/types'
import { loading } from './loading'
import type { Token } from '../types'
import * as chainEvents from './chain-events'
import { chainsMetadata } from './auth/constants'
import { multicallErc20, multicallRead } from '$lib/utils'
import _ from 'lodash'
import { uniV2Settings, destinationChains, defaultAssetIn, nativeAssetOut, whitelisted } from './config'
import * as abis from './abis'
import * as imageLinks from './image-links'
import { isZero, stripNonNumber } from './utils'
import { latestBaseFeePerGas } from './chain-events'

export const backupAssetIn = {
  address: zeroAddress,
  name: 'unknown',
  symbol: 'xxx',
  decimals: 18,
  logoURI: '',
  chainId: 369,
} as Token

/** the asset coming out on the other side of the bridge (foreign) */
export const assetOut = asyncDerived(
  [input.bridgeKey, input.assetIn],
  async ([$bridgeKey, $assetIn]) => {
    if (!$assetIn) {
      return backupAssetIn
    }
    const tokenInfo = await chainEvents.tokenBridgeInfo([$bridgeKey, $assetIn])
    if (!tokenInfo) {
      return backupAssetIn
    }
    const { toHome, toForeign } = tokenInfo
    let res = backupAssetIn
    const foreign = toHome?.foreign || toForeign?.foreign
    if (foreign && foreign !== zeroAddress) {
      const r = await multicallErc20({
        client: input.clientFromChain($bridgeKey),
        chain: chainsMetadata[$bridgeKey],
        target: foreign,
      }).catch(() => null)
      if (!r) {
        return backupAssetIn
      }
      const [name, symbol, decimals] = r
      res = {
        name,
        symbol,
        decimals,
        chainId: Number($bridgeKey),
        address: foreign,
      } as Token
      res.logoURI = imageLinks.image(res)
    } else {
      // assumptions
      res = {
        ...$assetIn,
        chainId: Number($bridgeKey),
        address: zeroAddress,
        name: `${$assetIn.name} from Pulsechain`,
        symbol: `w${$assetIn.symbol}`,
      } as Token
    }
    return res
  },
  backupAssetIn,
)

export const foreignTokenBalance = derived<
  [Readable<Hex | undefined>, Readable<PublicClient>, Readable<DestinationChains>, Readable<Token>, Readable<boolean>],
  null | bigint
>(
  [walletAccount, chainEvents.destinationPublicClient, input.bridgeKey, assetOut, input.unwrap],
  ([$walletAccount, $publicClient, $bridgeKey, $assetOut, $unwrap], set) => {
    let cancelled = false
    if (!$assetOut || $assetOut.address === zeroAddress || !$walletAccount || $walletAccount === zeroAddress) {
      set(0n)
      return
    }
    set(null)
    loading.increment('balance')
    const unwrappable = nativeAssetOut[$bridgeKey as DestinationChains]
    const getNativeBalance = async () => {
      const balance = await $publicClient.getBalance({
        address: $walletAccount,
      })
      if (cancelled) return
      set(balance)
    }
    if ($unwrap && getAddress(unwrappable) === getAddress($assetOut.address)) {
      getNativeBalance()
      const unwatch = $publicClient.watchBlocks({
        onBlock: () => {
          loading.decrement('balance')
          getNativeBalance()
        },
      })
      return () => {
        loading.decrement('balance')
        unwatch?.()
        cancelled = true
      }
    }
    const token = getContract({
      address: $assetOut.address,
      abi: erc20Abi,
      client: $publicClient,
    })
    const getBalance = async () => {
      const balance = await token.read.balanceOf([$walletAccount])
      if (cancelled) return
      loading.decrement('balance')
      set(balance)
    }
    const account = getAddress($walletAccount)
    if ($bridgeKey === Chains.ETH) {
      const unwatch = $publicClient.watchContractEvent({
        abi: erc20Abi,
        eventName: 'Transfer',
        address: $assetOut.address,
        onLogs: (logs) => {
          if (
            logs.find((l) => getAddress(l.args.from as Hex) === account || getAddress(l.args.to as Hex) === account)
          ) {
            getBalance().catch(console.error)
          }
        },
      })
      getBalance().catch(console.error)
      return () => {
        cancelled = true
        loading.decrement('balance')
        unwatch()
      }
    } else {
      const unwatch = $publicClient.watchBlocks({
        onBlock: () => {
          getBalance().catch(console.error)
        },
      })
      return () => {
        cancelled = true
        loading.decrement('balance')
        unwatch()
      }
    }
  },
  null,
)

export const unwrap = derived([input.unwrap, input.canChangeUnwrap], ([$unwrapSetting, $canChangeUnwrap]) => {
  return $canChangeUnwrap && $unwrapSetting
})
/** the direction of the bridge crossing */
export const fromNetwork = derived([input.bridgeKey], ([$bridgeKey]) =>
  $bridgeKey === Chains.ETH ? Chains.PLS : Chains.PLS,
)
export const toNetwork = derived([input.bridgeKey], ([$bridgeKey]) =>
  $bridgeKey === Chains.ETH ? Chains.ETH : Chains.BNB,
)

export const oneEther = 10n ** 18n

export const desiredExcessCompensationBasisPoints = derived(
  [input.assetIn, input.feeType, whitelisted],
  ([$assetIn, $feeType, $whitelisted]) => {
    return !$assetIn
      ? 0n
      : $feeType === input.FeeType.PERCENT
        ? 1_000n
        : input.isNative($assetIn)
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
    $bridgeKey: DestinationChains
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
    abi: abis.pulsexRouter,
    // pulsex router
    calls: _.flatMap(uniV2Settings[chain].routers, (target) =>
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
export const amountToBridge = derived([input.amountIn, input.assetIn], ([$amountIn, $assetIn]) => {
  if (isZero($amountIn) || !$assetIn) return 0n
  return parseUnits(stripNonNumber($amountIn), $assetIn.decimals)
})
export const priceCorrective = derived(
  [input.assetIn, input.bridgeKey, chainEvents.assetLink, oneTokenInt, assetOut, amountToBridge, latestBaseFeePerGas],
  ([$assetIn, $bridgeKey, $assetLink, $oneTokenInt, $assetOut, $amountToBridge, $latestBaseFeePerGas], set) => {
    // check if recognized as wrapped
    // if recognized as wrapped, use oneEther
    let cancelled = false
    priceCorrectiveGuard = {}
    const pcg = priceCorrectiveGuard
    if (!$assetIn) {
      // console.log('zero address', $assetIn, $assetOut)
      set(0n)
      return
    }
    if (!$assetOut || input.isNative($assetIn)) {
      set(oneEther)
      return
    }
    // the max fee i am targeting is 10%
    let toBridge = $amountToBridge / 10n
    if (toBridge === 0n) {
      toBridge = parseUnits('10', $assetIn.decimals)
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
      return (last * $oneTokenInt) / toBridge
    }
    loading.increment('gas')
    Promise.all([
      $bridgeKey === Chains.ETH && $assetLink && $assetLink.toHome && $assetOut.address !== zeroAddress
        ? readAmountOut(
          {
            $assetInAddress: $assetOut.address,
            $oneTokenInt: toBridge,
            chain: $bridgeKey,
            $bridgeKey,
          },
          $latestBaseFeePerGas,
          [[$assetIn.address, uniV2Settings[$bridgeKey].wNative]],
        )
        : ([[]] as FetchResult[]),
      readAmountOut(
        {
          $assetInAddress: $assetIn.address,
          $oneTokenInt: toBridge,
          chain: Chains.PLS,
          $bridgeKey,
        },
        $latestBaseFeePerGas,
        [
          [$assetIn.address, uniV2Settings[Chains.PLS].wNative, defaultAssetIn[$bridgeKey].address],
          [$assetIn.address, defaultAssetIn[$bridgeKey].address],
        ],
      ),
    ]).then((results) => {
      // console.log(results)
      if (cancelled) return
      loading.decrement('gas')
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
    return () => {
      loading.decrement('gas')
      cancelled = true
    }
  },
  oneEther,
)

/**
 * the oneTokenInt, estimated cost for running a transaction
 * on the foreign network, given current gas conditions
 */
export const estimatedNetworkCost = derived(
  [input.estimatedGas, latestBaseFeePerGas, priceCorrective, oneTokenInt],
  ([$estimatedGas, $latestBaseFeePerGas, $priceCorrective, $oneTokenInt]) => {
    if (!$priceCorrective) {
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
export const fee = derived([input.fee], ([$fee]) => {
  if (isZero($fee)) return 0n
  return parseUnits(stripNonNumber($fee), 18) / 100n
})

/** the number of tokens charged as fee for crossing the bridge */
export const bridgeCost = derived(
  [amountToBridge, input.bridgeFrom, fromNetwork, toNetwork],
  ([$amountToBridge, $bridgeFrom, $fromNetwork, $toNetwork]) => {
    return ($amountToBridge * $bridgeFrom.get($fromNetwork)!.get($toNetwork)!.feeH2F) / oneEther
  },
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
    return $bridgeKey === Chains.ETH
      ? encodeFunctionData({
        abi: abis.erc677ETH,
        functionName: 'transferAndCall',
        args: [destinationChains[$bridgeKey].homeBridge, $amountToBridge, $foreignDataParam],
      })
      : encodeFunctionData({
        abi: abis.erc677BNB,
        functionName: 'transferAndCall',
        args: [
          destinationChains[$bridgeKey].homeBridge,
          $amountToBridge,
          $foreignDataParam,
          $walletAccount || zeroAddress,
        ],
      })
  },
)

export const assetSources = (asset: Token | null) => {
  if (!asset) {
    return ''
  }
  const bridgedImage = [
    ...Object.entries(asset.extensions?.bridgeInfo || {}).map(([chainId, info]) => {
      if (!info.tokenAddress) {
        return null
      }
      return `${Number(chainId)}/${info.tokenAddress}`
    }),
  ] as string[]
  if (!asset.chainId) {
    console.trace(asset)
  }
  const sources = _(bridgedImage.concat([`${asset.chainId}/${asset.address}`]))
    .compact()
    .uniq()
    .value()
  return imageLinks.images(sources)
}

export const getOriginationChainId = (asset: Token | null) => {
  if (!asset) {
    return Number(Chains.PLS)
  }
  const bridgeInfo = asset.extensions?.bridgeInfo
  const $bridgeKey = get(input.bridgeKey)
  if (_.isEmpty(bridgeInfo)) {
    return Number($bridgeKey)
  }
  const bridgeKeyInfo = bridgeInfo[Number($bridgeKey)]
  if (bridgeKeyInfo) {
    return getAddress(destinationChains[$bridgeKey].foreignBridge) ===
      getAddress(bridgeKeyInfo.originationBridgeAddress)
      ? Number($bridgeKey)
      : Number(Chains.PLS)
  }
  const info = bridgeInfo[Number(Chains.PLS)]
  if (!info) {
    return asset.chainId
  }
  return getAddress(destinationChains[$bridgeKey].homeBridge) === getAddress(info.originationBridgeAddress)
    ? Number($bridgeKey)
    : Number(Chains.PLS)
}

import { derived, get, writable } from 'svelte/store'
import * as input from '$lib/stores/input'
import { derived as asyncDerived } from './async'
import * as viem from 'viem'
import { Chains, type DestinationChains } from './auth/types'
import { loading } from './loading'
import type { Token } from '../types'
import { chainsMetadata } from './auth/constants'
import { multicallErc20, multicallRead } from '$lib/utils'
import _ from 'lodash'
import { uniV2Settings, destinationChains, defaultAssetIn, nativeAssetOut } from './config'
import * as abis from './abis'
import * as imageLinks from './image-links'
import { isZero, stripNonNumber } from './utils'
import { latestBaseFeePerGas } from './chain-events'
import { walletAccount } from './auth/store'

export const provider = derived([input.bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].provider)

export const foreignSupportsEIP1559 = derived([input.bridgeKey], ([$bridgeKey]) => ($bridgeKey === Chains.BNB ? false : true))
/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = writable(400_000n)
/** the first recipient of the tokens (router) */
export const router = derived([input.bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].router as viem.Hex)
/** the address of the bridge proxy contract on home */
export const bridgeAddress = derived([input.bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].homeBridge as viem.Hex)
export const foreignBridgeAddress = derived([input.bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].foreignBridge as viem.Hex)
const backupAssetIn = {
  address: viem.zeroAddress,
  name: 'unknown',
  symbol: 'xxx',
  decimals: 18,
  logoURI: '',
  chainId: 369,
} as Token

export const tokenBridgeInfo = async ([$bridgeKey, $assetIn]: [DestinationChains, Token]): Promise<{
  toForeign?: {
    home: viem.Hex;
    foreign?: viem.Hex;
  },
  toHome?: {
    home: viem.Hex;
    foreign: viem.Hex;
  },
}> => {
  const args = [$assetIn.address]
  const mappings = await multicallRead<viem.Hex[]>({
    client: input.clientFromChain(Chains.PLS),
    chain: chainsMetadata[Chains.PLS],
    abi: abis.inputBridge,
    target: destinationChains[$bridgeKey].homeBridge,
    calls: [
      { functionName: 'bridgedTokenAddress', args },
      { functionName: 'nativeTokenAddress', args },
    ],
  })
  let [
    foreignTokenAddress, // bridgedTokenAddress
    nativeTokenAddress,
  ] = mappings

  if (foreignTokenAddress !== viem.zeroAddress) {
    // if we are here, then we know that we are dealing with a native
    // address, so we need to go to the foreign chain
    const mappings = await multicallRead<viem.Hex[]>({
      client: input.clientFromChain($bridgeKey),
      chain: chainsMetadata[$bridgeKey],
      abi: abis.inputBridge,
      target: destinationChains[$bridgeKey].foreignBridge,
      calls: [
        { functionName: 'bridgedTokenAddress', args },
        { functionName: 'nativeTokenAddress', args },
      ],
    })
    foreignTokenAddress = mappings[0]
    nativeTokenAddress = args[0]
    if (nativeTokenAddress === $assetIn.address) {
      return {
        toForeign: {
          foreign: foreignTokenAddress,
          home: $assetIn.address,
        },
      }
    }
  } else if (nativeTokenAddress !== viem.zeroAddress) {
    return {
      toHome: {
        foreign: nativeTokenAddress,
        home: $assetIn.address,
      },
    }
  }
  return {
    toForeign: {
      home: $assetIn.address,
    },
  }
  // fallback case
}

const checkApproval = async (
  [$walletAccount, $bridgeAddress, $assetLink, $publicClient]:
    [viem.Hex | undefined, viem.Hex, null | Awaited<ReturnType<typeof tokenBridgeInfo>>, viem.PublicClient]
) => {
  if (!$walletAccount) {
    return 0n
  }
  if (!$assetLink || $assetLink.toHome) {
    return 0n // irrelevant
  }
  const token = viem.getContract({
    abi: viem.erc20Abi,
    address: $assetLink.toForeign!.home!,
    client: $publicClient,
  })
  const allowance = await token.read.allowance([$walletAccount, $bridgeAddress])
  return allowance
}

export const assetLink = asyncDerived([input.bridgeKey, input.assetIn], tokenBridgeInfo, null)

export const approval = asyncDerived([walletAccount, bridgeAddress, assetLink, input.publicClient], checkApproval, 0n)

/** the asset coming out on the other side of the bridge (foreign) */
export const assetOut = asyncDerived(
  [input.bridgeKey, input.assetIn],
  async ([$bridgeKey, $assetIn]) => {
    const { toHome, toForeign } = await tokenBridgeInfo([$bridgeKey, $assetIn])
    let res = backupAssetIn
    const foreign = toHome?.foreign || toForeign?.foreign
    if (foreign && foreign !== viem.zeroAddress) {
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
        name, symbol, decimals,
        chainId: Number($bridgeKey),
        address: foreign,
      } as Token
      res.logoURI = imageLinks.image(res)
    } else {
      // assumptions
      res = {
        ...$assetIn,
        chainId: Number($bridgeKey),
        address: viem.zeroAddress,
        name: `${$assetIn.name} from Pulsechain`,
        symbol: `w${$assetIn.symbol}`,
      } as Token
    }
    return res
  }, backupAssetIn)

export const unwrap = derived([input.unwrap, input.canChangeUnwrap], ([$unwrapSetting, $canChangeUnwrap]) => {
  return $canChangeUnwrap && $unwrapSetting
})
/** the direction of the bridge crossing */
export const fromNetwork = derived([input.bridgeKey], ([$bridgeKey]) => ($bridgeKey === Chains.ETH ? Chains.PLS : Chains.PLS))
export const toNetwork = derived([input.bridgeKey], ([$bridgeKey]) => ($bridgeKey === Chains.ETH ? Chains.ETH : Chains.BNB))

export const oneEther = 10n ** 18n

export const desiredExcessCompensationBasisPoints = derived([input.assetIn, input.feeType], ([$assetIn, $feeType]) => {
  const native = input.isNative($assetIn)
  return $feeType === input.FeeType.PERCENT
    ? 1_000n
    : $feeType === input.FeeType.GAS_TIP
      ? native ? 1_000n : 5_000n
      // fixed
      : native ? 5_000n : 10_000n
})

export const desiredCompensationRatio = derived(
  [desiredExcessCompensationBasisPoints],
  ([$desiredExcessCompensationBasisPoints]) => {
    return oneEther + (($desiredExcessCompensationBasisPoints * oneEther) / 10_000n)
  })

export const desiredExcessCompensationPercentage = derived(
  [desiredExcessCompensationBasisPoints],
  ([$desiredExcessCompensationBasisPoints]) => (
    viem.formatUnits($desiredExcessCompensationBasisPoints, 2)
  )
)

const oneTokenInt = derived([input.assetIn], ([$assetIn]) => (
  10n ** BigInt($assetIn.decimals)
))

let priceCorrectiveGuard = {}
type FetchResult = bigint[] | viem.Hex
const fetchCache = new Map<string, {
  time: number;
  result: Promise<[FetchResult]>;
}>()
setInterval(() => {
  const now = Date.now()
  for (const [k, cached] of fetchCache.entries()) {
    if (cached.time + 20_000 < now) {
      fetchCache.delete(k)
    }
  }
}, 5_000)
const readAmountOut = ({
  $oneTokenInt, $assetInAddress, chain, $bridgeKey,
}: {
  $oneTokenInt: bigint;
  $assetInAddress: viem.Hex;
  chain: Chains;
  $bridgeKey: DestinationChains;
}, baseFee: bigint): Promise<[FetchResult]> => {
  const key = `${chain}-${$bridgeKey}-${baseFee}-${$assetInAddress}-${$oneTokenInt}`
  let res = fetchCache.get(key)
  if (res) {
    return res.result
  }
  const q = multicallRead<[bigint[] | viem.Hex]>({
    chain: chainsMetadata[chain],
    client: input.clientFromChain(chain),
    abi: abis.pulsexRouter,
    // pulsex router
    target: uniV2Settings[chain].router,
    calls: [{
      functionName: 'getAmountsOut',
      allowFailure: true,
      args: [
        // if 1 token goes into swap
        $oneTokenInt,
        [
          // take the asset, go through wNative, then to wrapped native
          $assetInAddress,
          uniV2Settings[chain].wNative,
        ].concat(
          chain === Chains.PLS
            ? [defaultAssetIn[$bridgeKey].address]
            : []
        ),
      ]
    }],
  })
  fetchCache.set(key, {
    time: Date.now(),
    result: q,
  })
  return q
}
/** the number of tokens to push into the bridge (before fees) */
export const amountToBridge = derived([input.amountIn, input.assetIn], ([$amountIn, $assetIn]) => {
  if (isZero($amountIn)) return 0n
  return viem.parseUnits(stripNonNumber($amountIn), $assetIn.decimals)
})
export const priceCorrective = derived(
  [input.assetIn, input.bridgeKey, assetLink, oneTokenInt, assetOut, amountToBridge, latestBaseFeePerGas],
  ([$assetIn, $bridgeKey, $assetLink, $oneTokenInt, $assetOut, $amountToBridge, $latestBaseFeePerGas], set) => {
    // check if recognized as wrapped
    // if recognized as wrapped, use oneEther
    let cancelled = false
    priceCorrectiveGuard = {}
    const pcg = priceCorrectiveGuard
    if (!$assetOut || input.isNative($assetIn) || $assetOut.address === viem.zeroAddress) {
      set(oneEther)
      return
    }
    // the max fee i am targeting is 10%
    let toBridge = $amountToBridge / 10n
    if (toBridge === 0n) {
      toBridge = viem.parseUnits('10', $assetIn.decimals)
    }
    const outputFromRouter = (result: [viem.Hex | bigint[]]) => {
      if (cancelled || priceCorrectiveGuard !== pcg) return
      const [hops] = result
      if (Array.isArray(hops)) {
        const last = hops[hops.length - 1]
        return (last * $oneTokenInt) / toBridge
      }
    }
    loading.increment('gas')
    Promise.all([
      $bridgeKey === Chains.ETH && $assetLink && $assetLink.toHome ? readAmountOut({
        $assetInAddress: $assetOut.address,
        $oneTokenInt: toBridge,
        chain: $bridgeKey,
        $bridgeKey,
      }, $latestBaseFeePerGas) : ['0x'] as [viem.Hex],
      readAmountOut({
        $assetInAddress: $assetIn.address,
        $oneTokenInt: toBridge,
        chain: Chains.PLS,
        $bridgeKey,
      }, $latestBaseFeePerGas),
    ]).then((results) => {
      if (cancelled) return
      loading.decrement('gas')
      const [outputToken, inputToken] = results.map(outputFromRouter)
      // console.log([outputToken, inputToken])
      const res = outputToken && outputToken > 0n ? (
        inputToken && inputToken > outputToken && inputToken / outputToken === 1n ? inputToken : outputToken
      ) : inputToken
      // console.log('setting price corrective', res)
      set(res || 0n)
    })
    return () => {
      loading.decrement('gas')
      cancelled = true
    }
  }, oneEther)

/**
 * the oneTokenInt, estimated cost for running a transaction
 * on the foreign network, given current gas conditions
 */
export const estimatedNetworkCost = derived(
  [estimatedGas, latestBaseFeePerGas, priceCorrective, oneTokenInt],
  ([$estimatedGas, $latestBaseFeePerGas, $priceCorrective, $oneTokenInt]) => {
    if (!$priceCorrective) {
      return 0n
    }
    return $estimatedGas * $latestBaseFeePerGas * $oneTokenInt / $priceCorrective
  },
)
/** the maximum number of tokens that the user wishes to pay in fees */
export const limit = derived([input.limit, input.assetIn], ([$limit, $assetIn]) => {
  if (isZero($limit)) return 0n
  return viem.parseUnits(stripNonNumber($limit), $assetIn.decimals)
})
export const fee = derived([input.fee], ([$fee]) => {
  if (isZero($fee)) return 0n
  return viem.parseUnits(stripNonNumber($fee), 18) / 100n
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
  return $amountToBridge - $bridgeCost
})

export const limitFromPercent = derived([fee, amountAfterBridgeFee], ([$fee, $amountAfterBridgeFee]) => {
  // console.log($fee, $amountAfterBridgeFee)
  return $amountAfterBridgeFee * $fee / oneEther
})

/** the estimated network cost + tip */
export const baseFeeReimbersement = derived(
  [estimatedNetworkCost, fee],
  ([$estimatedNetworkCost, $fee]) => {
    return $estimatedNetworkCost * (oneEther + $fee) / oneEther
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
    // console.log($feeType, $limitFromPercent, $limit, $clampedReimbersement)
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
export const feeTypeSettings = derived(
  [input.feeType, unwrap],
  ([$feeType, $unwrap]) => {
    const th0 = $feeType === input.FeeType.FIXED ? 1n : 0n
    const st1 = $unwrap ? 1n : 0n
    const nd2 = 1n // always exclude priority when you can
    const rd3 = $feeType === input.FeeType.PERCENT ? 1n : 0n
    return (rd3 << 3n) | (nd2 << 2n) | (st1 << 1n) | th0
  },
)

/** the encoded struct to be passed to the foreign router */
export const feeDirectorStructEncoded = derived(
  [input.recipient, feeTypeSettings, limit, fee, input.feeType, assetOut, priceCorrective],
  ([$recipient, $feeTypeSettings, $limit, $fee, $feeType, $assetOut, $priceCorrective]) => {
    let multiplier = 0n
    if ($feeType === input.FeeType.GAS_TIP && $priceCorrective > 0n) {
      multiplier = (oneEther + $fee) * (10n ** BigInt($assetOut.decimals)) / $priceCorrective
    } else if ($feeType === input.FeeType.PERCENT) {
      multiplier = $fee
    }
    if (!viem.isAddress($recipient)) {
      return '0x'
    }
    return viem.encodeAbiParameters(abis.feeDeliveryStruct, [
      [
        $recipient,
        $feeTypeSettings,
        $limit,
        multiplier,
      ],
    ])
  },
)
/**
 * the full calldata defined in the home bridge's _data prop
 * to be used to call on the foreign router
 */
export const foreignData = derived([router, feeDirectorStructEncoded], ([$router, $feeDirectorStructEncoded]) => {
  return viem.concatHex([$router, $feeDirectorStructEncoded])
})
/**
 * the calldata that will be signed over by the user's wallet
 * this calldata transfers to the bridge address and the user's amount that they wish to bridge before fees
 * it also contains calldata that is shuttled over to the foreign network
 * to be executed there after validator signatures are provided
 */
export const calldata = derived(
  [bridgeAddress, amountToBridge, foreignData],
  ([$bridgeAddress, $amountToBridge, $foreignData]) => {
    return viem.encodeFunctionData({
      abi: abis.erc677,
      functionName: 'transferAndCall',
      args: [$bridgeAddress, $amountToBridge, $foreignData],
    })
  },
)

export const foreignCalldata = derived(
  [assetOut, amountAfterBridgeFee, feeDirectorStructEncoded],
  ([$assetOut, $amountAfterBridgeFee, $feeDirectorStructEncoded]) => {
    const output = $assetOut
    if (!output) return ''
    return viem.encodeFunctionData({
      abi: abis.outputRouter,
      functionName: 'onTokenBridged',
      args: [output.address, $amountAfterBridgeFee, $feeDirectorStructEncoded],
    })
  }
)

export const assetSources = (asset: Token) => {
  const bridgedImage = [...Object.entries(asset.extensions?.bridgeInfo || {}).map(([chainId, info]) => {
    if (!info.tokenAddress) {
      return null
    }
    return `${Number(chainId)}/${info.tokenAddress}`
    // return imageLinks.image({
    //   address: info.tokenAddress,
    //   chainId: Number(chainId),
    // })
  })] as string[]
  if (!asset.chainId) {
    console.trace(asset)
  }
  const sources = _(bridgedImage.concat([`${asset.chainId}/${asset.address}`]))
    .compact()
    .uniq()
    .value()
  return imageLinks.images(sources)
}

export const getOriginationChainId = (asset: Token) => {
  const bridgeInfo = asset.extensions?.bridgeInfo
  const $bridgeKey = get(input.bridgeKey)
  if (_.isEmpty(bridgeInfo)) {
    return Number($bridgeKey)
  }
  const bridgeKeyInfo = bridgeInfo[Number($bridgeKey)]
  if (bridgeKeyInfo) {
    return viem.getAddress(destinationChains[$bridgeKey].foreignBridge) === viem.getAddress(bridgeKeyInfo.originationBridgeAddress)
      ? Number($bridgeKey)
      : Number(Chains.PLS)
  }
  const info = bridgeInfo[Number(Chains.PLS)]
  if (!info) {
    return asset.chainId
  }
  return viem.getAddress(destinationChains[$bridgeKey].homeBridge) === viem.getAddress(info.originationBridgeAddress)
    ? Number($bridgeKey)
    : Number(Chains.PLS)
}

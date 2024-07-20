import { derived, get, writable, type Readable, type Stores } from 'svelte/store'
import * as input from '$lib/stores/input'
import { derived as asyncDerived } from './async'
import * as viem from 'viem'
import { Chains, type DestinationChains } from './auth/types'
import { loading } from './loading'
import { page } from '$app/stores'
import type { Extensions, Token, TokenList } from '../types'
import { chainsMetadata } from './auth/constants'
import { multicallErc20, multicallRead } from '$lib/utils'
import _ from 'lodash'
import { uniV2Settings, destinationChains, defaultAssetIn, nativeAssetOut } from './config'
import * as abis from './abis'
import { feeManagerMapping } from './fee-manager'
import * as imageLinks from './image-links'
import { humanReadableNumber, isZero, stripNonNumber } from './utils'

export const activeChain = writable<Chains>(Chains.PLS)
export const walletClient = writable<viem.WalletClient | undefined>()

export const clientFromChain = ($activeChain: Chains) => {
  return viem.createPublicClient({
    chain: chainsMetadata[$activeChain],
    transport: viem.http(),
  })
}

export const publicClient = derived(activeChain, clientFromChain)
export const multicall = derived([activeChain, publicClient], ([$activeChain, $publicClient]) => {
  const metadata = chainsMetadata[$activeChain]
  return viem.getContract({
    abi: viem.multicall3Abi,
    client: $publicClient,
    address: metadata.contracts!.multicall3!.address,
  })
})

export const bridgeFrom = writable(feeManagerMapping)

export const bridgeKeys = Object.keys(destinationChains) as DestinationChains[]

export const bridgeKey = derived([page], ([$page]) => (Chains[$page.params.route as keyof typeof Chains] || Chains.ETH) as DestinationChains)

export const bridgeFee = derived([bridgeFrom, bridgeKey], ([$bridgeFrom, $bridgeKey]) => (
  $bridgeFrom.get(Chains.PLS)!.get($bridgeKey)!.feeH2F
))

export const provider = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].provider)

export const foreignSupportsEIP1559 = derived([bridgeKey], ([$bridgeKey]) => ($bridgeKey === Chains.BNB ? false : true))
/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = writable(400_000n)
/** the block.baseFeePerGas on the latest block */
export const latestBaseFeePerGas = writable(0n)
/** the first recipient of the tokens (router) */
export const router = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].router as viem.Hex)
/** the final destination of the tokens (user's wallet or other named address) */
export const destination = writable(viem.zeroAddress as viem.Hex)
/** whether or not to unwrap the tokens to their native value */
export const unwrapSetting = writable(true)
/** the asset going into the home bridge */
export const desiredAssetIn = writable<Token | null>(null)
const fetchedAssetIn: Readable<Token | null> = derived([desiredAssetIn, bridgeKey], ([$desiredAssetIn, $bridgeKey], set) => {
  if (!$desiredAssetIn) {
    set(null)
    return
  }
  const addr = viem.getAddress($desiredAssetIn.address)
  if (defaultAssetIn[$bridgeKey].address === addr) {
    set(defaultAssetIn[$bridgeKey])
    return
  }
  set(null)
  multicallErc20({
    client: clientFromChain(Chains.PLS),
    target: addr,
    chain: chainsMetadata[Chains.PLS],
  }).then(([name, symbol, decimals]) => {
    if ($desiredAssetIn !== get(desiredAssetIn)) {
      console.log('skip set')
      return
    }
    const tkn = {
      name, symbol, decimals,
      address: addr,
      chainId: Number(Chains.PLS),
    } as Token
    tkn.logoURI = $desiredAssetIn.logoURI || imageLinks.image(tkn)
    tkn.extensions = getExtensions(tkn)
    set(tkn)
  })
})
export const assetIn = derived([fetchedAssetIn, bridgeKey, desiredAssetIn], ([$fetchedAssetIn, $bridgeKey, $desiredAssetIn]) => {
  return $fetchedAssetIn || $desiredAssetIn || defaultAssetIn[$bridgeKey]
})
/** the address of the bridge proxy contract on home */
export const bridgeAddress = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].homeBridge as viem.Hex)
export const foreignBridgeAddress = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].foreignBridge as viem.Hex)
const backupAssetIn = {
  address: viem.zeroAddress,
  name: 'unknown',
  symbol: 'xxx',
  decimals: 18,
  logoURI: '',
  chainId: 369,
} as Token

const extensions = new Map<string, Extensions>()

export const registerExtensions = (t: Token, tokenExts: Extensions | undefined) => {
  extensions.set(uniqueTokenKey(t), tokenExts as any)
}

export const getExtensions = (t: Token) => {
  return extensions.get(uniqueTokenKey(t))
}

/** the asset coming out on the other side of the bridge (foreign) */
export const assetOut = asyncDerived(
  [bridgeAddress, assetIn, bridgeKey],
  async ([$bridgeAddress, $assetIn, $bridgeKey]) => {
    const args = [$assetIn.address]
    const mappings = await multicallRead<viem.Hex[]>({
      client: clientFromChain(Chains.PLS),
      chain: chainsMetadata[Chains.PLS],
      abi: abis.inputBridge,
      target: $bridgeAddress,
      calls: [
        { functionName: 'bridgedTokenAddress', args },
        { functionName: 'nativeTokenAddress', args },
      ],
    })
    let [
      foreignTokenAddress, // bridgedTokenAddress
      nativeTokenAddress,
    ] = mappings
    // console.log(nativeTokenAddress, foreignTokenAddress)

    if (foreignTokenAddress !== viem.zeroAddress) {
      // if we are here, then we know that we are dealing with a native
      // address, so we need to go to the foreign chain
      const mappings = await multicallRead<viem.Hex[]>({
        client: clientFromChain($bridgeKey),
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
    } else if (nativeTokenAddress !== viem.zeroAddress) {
      foreignTokenAddress = nativeTokenAddress
    }

    let res = backupAssetIn
    if (foreignTokenAddress !== viem.zeroAddress) {
      const [name, symbol, decimals] = await multicallErc20({
        client: clientFromChain($bridgeKey),
        chain: chainsMetadata[$bridgeKey],
        target: foreignTokenAddress,
      })
      res = {
        name, symbol, decimals,
        chainId: Number($bridgeKey),
        address: foreignTokenAddress,
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
    res.extensions = getExtensions(res)
    return res
  }, backupAssetIn)

export const isNative = ($asset: Token) => {
  if ($asset.chainId === Number(Chains.PLS)) {
    // console.log(defaultAssetIn, $assetIn)
    return !!Object.values(defaultAssetIn).find(($defaultAssetIn) => (
      viem.getAddress($defaultAssetIn.address) === viem.getAddress($asset.address)
    ))
  } else {
    const chainId = `0x${$asset.chainId.toString(16)}` as DestinationChains
    return nativeAssetOut[chainId] === $asset.address
  }
}
export const canChangeUnwrap = derived([assetIn], ([$assetIn]) => (
  isNative($assetIn)
))
export const unwrap = derived([unwrapSetting, canChangeUnwrap], ([$unwrapSetting, $canChangeUnwrap]) => {
  return $canChangeUnwrap && $unwrapSetting
})
/** the direction of the bridge crossing */
export const fromNetwork = derived([bridgeKey], ([$bridgeKey]) => ($bridgeKey === Chains.ETH ? Chains.PLS : Chains.PLS))
export const toNetwork = derived([bridgeKey], ([$bridgeKey]) => ($bridgeKey === Chains.ETH ? Chains.ETH : Chains.BNB))

export const oneEther = 10n ** 18n

/** whether to use a fixed or gas based fee */
export const feeType = writable('%')

export const desiredExcessCompensationBasisPoints = derived([assetIn, feeType], ([$assetIn, $feeType]) => {
  const native = isNative($assetIn)
  return $feeType === '%'
    ? 1_000n
    : $feeType === 'gas+%'
      ? native ? 1_000n : 5_000n
      : native ? 5_000n : 10_000n
})

export const desiredCompensationRatio = derived(
  [desiredExcessCompensationBasisPoints],
  ([$desiredExcessCompensationBasisPoints]) => {
    return oneEther + ($desiredExcessCompensationBasisPoints * (oneEther / 10_000n))
  })

export const desiredExcessCompensationPercentage = derived(
  [desiredExcessCompensationBasisPoints],
  ([$desiredExcessCompensationBasisPoints]) => (
    viem.formatUnits($desiredExcessCompensationBasisPoints, 2)
  )
)

const oneTokenInt = derived([assetIn], ([$assetIn]) => (
  10n ** BigInt($assetIn.decimals)
))

let priceCorrectiveGuard = {}
const readAmountOut = ({
  $oneTokenInt, $assetInAddress, chain, $bridgeKey,
}: {
  $oneTokenInt: bigint;
  $assetInAddress: viem.Hex;
  chain: Chains;
  $bridgeKey: DestinationChains;
}) => (
  multicallRead<[bigint[] | viem.Hex]>({
    chain: chainsMetadata[chain],
    client: clientFromChain(chain),
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
)
/** the number of tokens to push into the bridge (before fees) */
export const amountToBridge = derived([input.amountIn, assetIn], ([$amountIn, $assetIn]) => {
  if (isZero($amountIn)) return 0n
  return viem.parseUnits(stripNonNumber($amountIn), $assetIn.decimals)
})
export const priceCorrective = derived(
  [assetIn, bridgeKey, oneTokenInt, assetOut, amountToBridge],
  ([$assetIn, $bridgeKey, $oneTokenInt, $assetOut, $amountToBridge], set) => {
    // check if recognized as wrapped
    // if recognized as wrapped, use oneEther
    let cancelled = false
    priceCorrectiveGuard = {}
    const pcg = priceCorrectiveGuard
    if (isNative($assetIn)) {
      set(oneEther)
      return
    }
    let toBridge = $amountToBridge
    if (toBridge === 0n) {
      toBridge = viem.parseUnits('10', $assetIn.decimals)
    }
    const outputFromRouter = (result: [viem.Hex | bigint[]]) => {
      if (cancelled || priceCorrectiveGuard !== pcg) return
      const [hops] = result
      if (Array.isArray(hops)) {
        const last = hops[hops.length - 1]
        return last
      }
    }
    Promise.all([
      readAmountOut({
        $assetInAddress: $assetOut.address,
        $oneTokenInt,
        chain: $bridgeKey,
        $bridgeKey,
      }),
      readAmountOut({
        $assetInAddress: $assetIn.address,
        $oneTokenInt,
        chain: Chains.PLS,
        $bridgeKey,
      }),
    ]).then((results) => {
      const [outputToken, inputToken] = results.map(outputFromRouter)
      const res = outputToken && outputToken > 0n ? (
        inputToken && inputToken > outputToken && inputToken / outputToken === 1n ? inputToken : outputToken
      ) : inputToken
      set(res || 0n)
    })
    return () => {
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
export const limit = derived([input.limit, assetIn], ([$limit, $assetIn]) => {
  if (isZero($limit)) return 0n
  return viem.parseUnits(stripNonNumber($limit), $assetIn.decimals)
})
export const fee = derived([input.fee], ([$fee]) => {
  if (isZero($fee)) return 0n
  return viem.parseUnits(stripNonNumber($fee), 18) / 100n
})

/** the number of tokens charged as fee for crossing the bridge */
export const bridgeCost = derived(
  [amountToBridge, bridgeFrom, fromNetwork, toNetwork],
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
  [baseFeeReimbersement, limit, feeType, limitFromPercent],
  ([$baseFeeReimbersement, $limit, $feeType, $limitFromPercent]) => {
    if ($feeType === '%') {
      return $limitFromPercent
    }
    return $baseFeeReimbersement > $limit ? $limit : $baseFeeReimbersement
  },
)
/** the estimated cost given the choice for a fixed fee, limit and incentive fee */
export const estimatedCost = derived(
  [feeType, limit, limitFromPercent, clampedReimbersement],
  ([$feeType, $limit, $limitFromPercent, $clampedReimbersement]) => {
    if ($feeType === '%') {
      return $limitFromPercent
    }
    if ($feeType === 'fixed') {
      return $limit
    }
    return $clampedReimbersement
  },
)
/** creates the settings param for the fee director struct */
export const feeTypeSettings = derived(
  [feeType, unwrap],
  ([$feeType, $unwrap]) => {
    const th0 = $feeType === 'fixed' ? 1n : 0n
    const st1 = $unwrap ? 1n : 0n
    const nd2 = 1n // always exclude priority when you can
    const rd3 = $feeType === '%' ? 1n : 0n
    return (rd3 << 3n) | (nd2 << 2n) | (st1 << 1n) | th0
  },
)

/** the encoded struct to be passed to the foreign router */
export const feeDirectorStructEncoded = derived(
  [destination, feeTypeSettings, limit, fee, feeType, assetOut, priceCorrective],
  ([$destination, $feeTypeSettings, $limit, $fee, $feeType, $assetOut, $priceCorrective]) => {
    let multiplier = 0n
    if ($feeType === 'gas+%' && $priceCorrective > 0n) {
      multiplier = (oneEther + $fee) * (10n ** BigInt($assetOut.decimals)) / $priceCorrective
    } else if ($feeType === '%') {
      multiplier = $fee
    }
    return viem.encodeAbiParameters(abis.feeDeliveryStruct, [
      [
        $destination,
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

export const loadFeeFor = async (fromId: Chains, toId: Chains) => {
  const settings = get(bridgeFrom).get(fromId)!.get(toId)!
  if (settings.feeH2F || settings.feeF2H) {
    return settings
  }
  loading.increment('fee')
  const $multicall = get(multicall)
  const [keyH2F, keyF2H] = await $multicall.read.aggregate3([
    [
      {
        allowFailure: false,
        target: settings.bridge,
        callData: viem.encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'HOME_TO_FOREIGN_FEE',
        }),
      },
      {
        allowFailure: false,
        target: settings.bridge,
        callData: viem.encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'FOREIGN_TO_HOME_FEE',
        }),
      },
    ],
  ])
  const [feeH2F, feeF2H] = await $multicall.read.aggregate3([
    [
      {
        allowFailure: false,
        target: settings.bridge,
        callData: viem.encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'getFee',
          args: [keyH2F.returnData, viem.zeroAddress],
        }),
      },
      {
        allowFailure: false,
        target: settings.bridge,
        callData: viem.encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'getFee',
          args: [keyF2H.returnData, viem.zeroAddress],
        }),
      },
    ],
  ])
  bridgeFrom.update(($bf) => {
    const fromBridgeSettings = $bf.get(fromId)!
    const toBridgeSettings = fromBridgeSettings.get(toId)!
    const updated = $bf.get(fromId)!.set(toId, {
      ...toBridgeSettings,
      feeH2F: BigInt(feeH2F.returnData),
      feeF2H: BigInt(feeF2H.returnData),
    })
    $bf.set(fromId, updated)
    return $bf
  })
  loading.decrement('fee')
  return get(bridgeFrom).get(fromId)!.get(toId)!
}

export const assetSources = (asset: Token) => {
  const bridgedImage = [...Object.entries(asset.extensions?.bridgeInfo || {}).map(([chainId, info]) => {
    if (!info.tokenAddress) {
      return null
    }
    return imageLinks.image({
      address: info.tokenAddress,
      chainId: Number(chainId),
    })
  })] as string[]
  if (!asset.chainId) {
    console.trace(asset)
  }
  return _(bridgedImage.concat([asset.logoURI]))
    .compact()
    .uniq()
    .value()
}

export const bridgableTokens = derived<Stores, Token[]>([], (() => {
  let tokens: null | Promise<Token[]> = null
  return ([], set) => {
    // let tokens = cache.get($provider)
    if (tokens) {
      tokens.then((t) => set(t))
      return
    }
    loading.increment()
    tokens = Promise.all([
      fetch(imageLinks.list('/pulsechain-bridge/foreign?extensions=bridgeInfo&chainId=369'), {
        credentials: 'omit',
      }),
      fetch(imageLinks.list('/tokensex-bridge/foreign?extensions=bridgeInfo&chainId=369'), {
        credentials: 'omit',
      }),
      fetch(imageLinks.list('/pulsechain-bridge/home?extensions=bridgeInfo&chainId=369'), {
        credentials: 'omit',
      }),
      fetch(imageLinks.list('/tokensex-bridge/home?extensions=bridgeInfo&chainId=369'), {
        credentials: 'omit',
      }),
    ]).then(async (results) => {
      const responses = await Promise.all(results.map(async (r) => (await r.json()) as TokenList))
      loading.decrement()
      const list = _(responses)
        .map('tokens')
        .flatten()
        .keyBy(uniqueTokenKey)
        .values()
        .value()
      const check = (cId: DestinationChains) => (item: Token) => (
        defaultAssetIn[cId].address === item.address
          ? defaultAssetIn[cId]
          : null
      )
      const checkETH = check(Chains.ETH)
      const checkBNB = check(Chains.BNB)
      const sortedList = _.sortBy(list, 'name').map((item) => (
        checkETH(item) || checkBNB(item) || item
      ))
      // console.log(sortedList)
      sortedList.forEach((token) => {
        // register on a central cache so that tokens that are gotten from onchain
        // still have all extensions
        registerExtensions(token, token.extensions)
        if (!token.logoURI) {
          token.logoURI = imageLinks.image(token)
        }
      })
      set(sortedList)
      return sortedList
    }).catch((err) => {
      loading.decrement()
      throw err
    })
  }
})(), [] as Token[])

export const uniqueTokenKey = (t: Token) => `${Number(t.chainId)}-${viem.getAddress(t.address)}`

export const getOriginationChainId = (asset: Token) => {
  const bridgeInfo = asset.extensions?.bridgeInfo
  const $bridgeKey = get(bridgeKey)
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

import { derived, get, writable, type Readable } from 'svelte/store'
import { derived as asyncDerived } from './async'
import * as viem from 'viem'
// import { multicall, publicClient } from './auth/store'
import { Chains, Provider, type DestinationChains } from './auth/types'
import { loading } from './loading'
import { page } from '$app/stores'
import type { Token } from '../types'
import { imageRoot } from '$lib/config'
import { chainsMetadata } from './auth/constants'
import { multicallErc20, multicallRead } from '$lib/utils'

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

type Settings = {
  bridge: viem.Hex
  feeH2F: bigint
  feeF2H: bigint
}

// should probably be merged with the "assets" object below
export const bridgeFrom = writable(
  new Map<Chains, Map<Chains, Settings>>([
    [
      Chains.PLS,
      new Map<Chains, Settings>([
        [
          Chains.ETH,
          {
            bridge: '0xba86ca0aeca30247f9e2fd8736879997bcd01dc4',
            feeH2F: 0n,
            feeF2H: 0n,
          },
        ],
        [
          Chains.BNB,
          {
            bridge: '0xbb00578b4eb6a14081797463ec57ab00a973edba',
            feeH2F: 0n,
            feeF2H: 0n,
          },
        ],
      ]),
    ],
  ]),
)

export const assets = {
  [Chains.ETH]: {
    provider: 'pulsechain',
    homeBridge: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
    foreignBridge: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
    router: '0x5f542C3ce02a56586a91A7DE80deBF29947836eD',
    // input: {
    //   symbol: 'WETH',
    //   name: 'Wrapped Ether from Ethereum',
    //   address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
    //   decimals: 18,
    //   networkOrigination: Chains.ETH,
    //   hostedNetwork: Chains.PLS,
    // },
    // output: {
    //   symbol: 'WETH',
    //   name: 'Wrapped Ether',
    //   address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //   decimals: 18,
    //   networkOrigination: Chains.ETH,
    //   hostedNetwork: Chains.ETH,
    //   native: {
    //     symbol: 'ETH',
    //     name: 'Ether',
    //   },
    // },
  },
  [Chains.BNB]: {
    provider: 'tokensex',
    homeBridge: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
    foreignBridge: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
    router: '0x47525293647C3725D911Cc0f6E000D2E831c4219',
    // input: {
    //   symbol: 'WBNB',
    //   name: 'Wrapped BNB from BSC (Tokens Express)',
    //   address: '0x518076CCE3729eF1a3877EA3647a26e278e764FE',
    //   decimals: 18,
    //   networkOrigination: Chains.BNB,
    //   hostedNetwork: Chains.PLS,
    // },
    // output: {
    //   symbol: 'WBNB',
    //   name: 'Wrapped BNB',
    //   address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    //   decimals: 18,
    //   networkOrigination: Chains.BNB,
    //   hostedNetwork: Chains.BNB,
    //   native: {
    //     symbol: 'BNB',
    //     name: 'BNB',
    //   },
    // },
  },
} as {
    [k in DestinationChains]: {
      provider: Provider,
      homeBridge: viem.Hex
      foreignBridge: viem.Hex
      router: viem.Hex
      // input?: Token
      // output?: Token
    }
  }

const defaultAssetIn = {
  [Chains.ETH]: {
    symbol: 'WETH',
    name: 'Wrapped Ether from Ethereum',
    address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
    decimals: 18,
    logoURI: imageRoot + '/1/0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
  },
  [Chains.BNB]: {
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    logoURI: imageRoot + '/56/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
} as Record<DestinationChains, Token>


export const bridgeKeys = Object.keys(assets) as DestinationChains[]

export const bridgeKey = derived([page], ([$page]) => (Chains[$page.params.route as keyof typeof Chains] || Chains.ETH) as DestinationChains)

export const foreignSupportsEIP1559 = derived([bridgeKey], ([$bridgeKey]) => ($bridgeKey === Chains.BNB ? false : true))
/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = writable(315_000n)
/** the block.baseFeePerGas on the latest block */
export const latestBaseFeePerGas = writable(0n)
/** the first recipient of the tokens (router) */
export const router = derived([bridgeKey], ([$bridgeKey]) => assets[$bridgeKey].router as viem.Hex)
/** the final destination of the tokens (user's wallet or other named address) */
export const destination = writable(viem.zeroAddress as viem.Hex)
/** whether or not to unwrap the tokens to their native value */
export const unwrapSetting = writable(true)
/** the asset going into the home bridge */
export const desiredAssetIn = writable<Token | null>(null)
const fetchedAssetIn: Readable<Token | null> = derived([activeChain, desiredAssetIn], ([$activeChain, $desiredAssetIn], set) => {
  set(null)
  if (!$desiredAssetIn) return
  const addr = $desiredAssetIn.address
  multicallErc20({
    client: clientFromChain($activeChain),
    target: addr,
    chain: chainsMetadata[$activeChain],
  }).then(([name, symbol, decimals]) => {
    if ($desiredAssetIn !== get(desiredAssetIn)) return
    // console.log(name, symbol, decimals, $desiredAssetIn)
    set({
      name, symbol, decimals,
      address: addr,
      logoURI: imageRoot + `/${Number($activeChain)}/${addr}`
    } as Token)
  })
})
export const assetIn = derived([fetchedAssetIn, bridgeKey, desiredAssetIn], ([$fetchedAssetIn, $bridgeKey, $desiredAssetIn]) => {
  return $fetchedAssetIn || $desiredAssetIn || defaultAssetIn[$bridgeKey]
})
/** the address of the bridge proxy contract on home */
export const bridgeAddress = derived([bridgeKey], ([$bridgeKey]) => assets[$bridgeKey].homeBridge as viem.Hex)
export const foreignBridgeAddress = derived([bridgeKey], ([$bridgeKey]) => assets[$bridgeKey].foreignBridge as viem.Hex)
/** the abi for the bridge */
export const inputBridgeAbi = viem.parseAbi([
  'function relayTokensAndCall(address token, address _receiver, uint256 _value, bytes memory _data) external',
  'function minPerTx(address token) external view returns(uint256)',
  'function foreignTokenAddress(address token) external view returns(address)',
  'function bridgedTokenAddress(address token) external view returns(address)',
  'function homeTokenAddress(address token) external view returns(address)',
  'function nativeTokenAddress(address token) external view returns(address)',
])
const backupAssetIn = {
  address: viem.zeroAddress,
  name: 'unknown',
  symbol: 'xxx',
  decimals: 18,
  logoURI: '',
} as Token
/** the asset coming out on the other side of the bridge (foreign) */
export const assetOut = asyncDerived(
  [activeChain, bridgeAddress, assetIn, bridgeKey],
  async ([$activeChain, $bridgeAddress, $assetIn, $bridgeKey]) => {
    const args = [$assetIn.address]
    const mappings = await multicallRead<viem.Hex[]>({
      client: clientFromChain($activeChain),
      chain: chainsMetadata[$activeChain],
      abi: inputBridgeAbi,
      target: $bridgeAddress,
      calls: [
        { functionName: 'homeTokenAddress', args },
        { functionName: 'foreignTokenAddress', args },
        // { functionName: 'bridgedTokenAddress', args },
        // { functionName: 'nativeTokenAddress', args },
      ],
    })
    const [
      homeTokenAddress, // foreign -> home
      foreignTokenAddress, // home -> foreign
      // this is a bridged token
      // bridgedTokenAddress,
      // nativeTokenAddress,
    ] = mappings

    if (homeTokenAddress !== viem.zeroAddress) {
      return backupAssetIn
    } else if (foreignTokenAddress !== viem.zeroAddress) {
      const [name, symbol, decimals, wNative] = await multicallRead<[string, string, number, viem.Hex]>({
        client: clientFromChain($bridgeKey),
        chain: chainsMetadata[$bridgeKey],
        abi: viem.erc20Abi,
        target: foreignTokenAddress,
        calls: [{
          functionName: 'name',
        }, {
          functionName: 'symbol',
        }, {
          functionName: 'decimals',
        }, {
          functionName: 'WETH',
          target: assets[$bridgeKey].router,
          abi: outputRouterAbi,
        }],
      })
      return {
        name, symbol, decimals,
        address: foreignTokenAddress,
        logoURI: imageRoot + `/${Number($bridgeKey)}/${foreignTokenAddress}`,
      }
    } else {
      // assumptions
      console.log('assumptions hit', $assetIn)
      return {
        ...$assetIn,
        address: viem.zeroAddress,
        name: `${$assetIn.name} from Pulsechain`,
        symbol: `w${$assetIn.symbol}`,
      }
    }
  }, backupAssetIn)

export const isNative = ($assetIn: Token) => {
  return !!Object.values(defaultAssetIn).find(($defaultAssetIn) => (
    viem.getAddress($defaultAssetIn.address) === viem.getAddress($assetIn.address)
  ))
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

/** the number of tokens to push into the bridge (before fees) */
export const amountToBridge = writable(0n)
/** the maximum number of tokens that the user wishes to pay in fees */
export const limit = writable(0n)
/** a ratio (1+x)/1 ether of how much the user would like to pay on top of network fees */
export const incentiveFee = writable(0n)
/** a ratio (x/1 ether) of how much of the total number of tokens should be allocated toward fees */
export const basisPointIncentiveFee = writable(0n)
export const erc677abi = viem.parseAbi([
  'function transferAndCall(address, uint256, bytes calldata) external',
])
export const erc677abiBNB = viem.parseAbi([
  'function transferAndCall(address, uint256, bytes calldata, address sender) external',
])
export const outputRouterAbi = viem.parseAbi([
  'function onTokenBridged(address _token, uint256 _value, bytes memory _data) external payable',
  'function WETH() external view returns(address)',
])
export const oneEther = 10n ** 18n

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
/** whether to use a fixed or gas based fee */
export const feeType = writable('%')

export const desiredCompensationRatio = derived(
  [assetIn, bridgeKey, feeType],
  ([$assetIn, $bridgeKey, $feeType]) => (
    oneEther + (
      $feeType === 'gas+%'
        ? viem.parseEther('0.05') // 5%
        : viem.getAddress(defaultAssetIn[$bridgeKey].address) === viem.getAddress($assetIn.address)
          // the reason these numbers are so much higher is because they are not linked to the gas that will be spent
          // so in order to give the best user experience, it is best to give people a higher buffer
          ? viem.parseEther('0.2') // 20%
          : viem.parseEther('0.5') // 50%
    )
  ))

const pulsexAbi = viem.parseAbi([
  'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns(uint256[] memory)',
])

const oneTokenInt = derived([assetIn], ([$assetIn]) => (
  10n ** BigInt($assetIn.decimals)
))

let priceCorrectiveGuard = {}
export const priceCorrective = derived(
  [assetIn, bridgeKey, oneTokenInt, assetOut, amountToBridge],
  ([$assetIn, $bridgeKey, $oneTokenInt, $assetOut, $amountToBridge], set) => {
    // check if recognized as wrapped
    // if recognized as wrapped, use oneEther
    let cancelled = false
    priceCorrectiveGuard = {}
    const pcg = priceCorrectiveGuard
    if (isNative($assetOut)) {
      set(oneEther)
      return
    }
    let toBridge = $amountToBridge
    if (toBridge === 0n) {
      toBridge = viem.parseUnits('10', $assetIn.decimals)
    }
    multicallRead<[bigint[] | viem.Hex]>({
      chain: chainsMetadata[Chains.PLS],
      client: clientFromChain(Chains.PLS),
      abi: pulsexAbi,
      // pulsex router
      target: '0x165C3410fC91EF562C50559f7d2289fEbed552d9',
      calls: [{
        functionName: 'getAmountsOut',
        allowFailure: true,
        args: [
          // if 1 token goes into swap
          $oneTokenInt,
          [
            // take the asset, go through wNative, then to wrapped native
            $assetIn.address,
            '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
            defaultAssetIn[$bridgeKey].address,
          ],
        ]
      }],
    }).then((result) => {
      if (cancelled || priceCorrectiveGuard !== pcg) return
      const [hops] = result
      if (Array.isArray(hops)) {
        const last = hops[hops.length - 1]
        return set(last)
      }
      // failure
      console.log('failed', $assetIn.address, hops)
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
    return $estimatedGas * $latestBaseFeePerGas * $oneTokenInt / $priceCorrective
  },
)
// export const loggedCost = derived(
//   [estimatedNetworkCost, assetIn, priceCorrective, latestBaseFeePerGas],
//   ([$estimatedNetworkCost, $assetIn, $priceCorrective, $latestBaseFeePerGas]) => {
//     console.log('with %o gwei, the network cost %s%s corrected %s',
//       viem.formatGwei($latestBaseFeePerGas),
//       viem.formatUnits($estimatedNetworkCost, $assetIn.decimals), $assetIn.symbol,
//       $priceCorrective,
//     )
//     return 0n
//   })
export const incentiveRatio = derived(
  [feeType, incentiveFee],
  ([$feeType, $incentiveFee]) => {
    if ($feeType === 'gas+%') {
      return oneEther + $incentiveFee
      // } else if ($feeType === '%') {
      //   return oneEther + $basisPointIncentiveFee
    }
    return 0n
  }
)
/** the estimated network cost + tip */
export const baseFeeReimbersement = derived(
  [estimatedNetworkCost, oneTokenInt, incentiveRatio],
  ([$estimatedNetworkCost, $oneTokenInt, $incentiveRatio]) => {
    let decimalOffset = 1n
    if ($oneTokenInt !== oneEther) {
      decimalOffset = oneEther / $oneTokenInt
    }
    // console.log(viem.formatUnits(($estimatedNetworkCost * $incentiveRatio) / (oneEther * decimalOffset), 6))
    return ($estimatedNetworkCost * $incentiveRatio) / (oneEther * decimalOffset)
  },
  0n,
)
/** the fee, clamped to the user defined limit */
export const clampedReimbersement = derived(
  [baseFeeReimbersement, limit, feeType, amountAfterBridgeFee, basisPointIncentiveFee],
  ([$baseFeeReimbersement, $limit, $feeType, $amountAfterBridgeFee, $basisPointIncentiveFee]) => {
    if ($feeType === '%') {
      return $amountAfterBridgeFee * $basisPointIncentiveFee / oneEther
    }
    return $baseFeeReimbersement > $limit ? $limit : $baseFeeReimbersement
  },
)
/** the estimated cost given the choice for a fixed fee, limit and incentive fee */
export const estimatedCost = derived(
  [feeType, limit, clampedReimbersement],
  ([$feeType, $limit, $clampedReimbersement]) => {
    if ($feeType === 'gas+%') return $clampedReimbersement
    return $limit
  },
)

export const feeTypeSettings = derived(
  [feeType, unwrap],
  ([$feeType, $unwrap]) => {
    const th0 = $feeType === 'fixed' ? 1n : 0n
    const st1 = $unwrap ? 1n : 0n
    const nd2 = 1n // always exclude priority when you can
    return (nd2 << 2n) | (st1 << 1n) || th0
  },
)
/** the encoded struct to be passed to the foreign router */
export const feeDirectorStructEncoded = derived(
  [destination, feeTypeSettings, limit, incentiveRatio],
  ([$destination, $feeTypeSettings, $limit, $incentiveRatio]) => {
    return viem.encodeAbiParameters(viem.parseAbiParameters('(address, uint256, uint256, uint256)'), [
      [$destination, $feeTypeSettings, $limit, $incentiveRatio],
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
      abi: erc677abi,
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
      abi: outputRouterAbi,
      functionName: 'onTokenBridged',
      args: [output.address, $amountAfterBridgeFee, $feeDirectorStructEncoded],
    })
  }
)

const feeManagerAbi = viem.parseAbi([
  'function HOME_TO_FOREIGN_FEE() public view returns(bytes32)',
  'function FOREIGN_TO_HOME_FEE() public view returns(bytes32)',
  'function getFee(bytes32, address) public view returns(uint256)',
])

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
          abi: feeManagerAbi,
          functionName: 'HOME_TO_FOREIGN_FEE',
        }),
      },
      {
        allowFailure: false,
        target: settings.bridge,
        callData: viem.encodeFunctionData({
          abi: feeManagerAbi,
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
          abi: feeManagerAbi,
          functionName: 'getFee',
          args: [keyH2F.returnData, viem.zeroAddress],
        }),
      },
      {
        allowFailure: false,
        target: settings.bridge,
        callData: viem.encodeFunctionData({
          abi: feeManagerAbi,
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

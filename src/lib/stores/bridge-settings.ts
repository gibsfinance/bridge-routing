import { derived, get, writable } from 'svelte/store'
import * as viem from 'viem'
import { multicall } from './auth/store'
import { Chains } from './auth/types'
import { loading } from './loading'
import { page } from '$app/stores'

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
  ETH: {
    provider: 'pulsechain',
    homeBridge: '0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef',
    foreignBridge: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
    router: '0x5f542C3ce02a56586a91A7DE80deBF29947836eD',
    input: {
      symbol: 'WETH',
      name: 'Wrapped Ether from Ethereum',
      address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
      decimals: 18,
      networkOrigination: Chains.ETH,
      hostedNetwork: Chains.PLS,
    },
    output: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      networkOrigination: Chains.ETH,
      hostedNetwork: Chains.ETH,
      native: {
        symbol: 'ETH',
        name: 'Ether',
      },
    },
  },
  BNB: {
    provider: 'tokensex',
    homeBridge: '0xf1DFc63e10fF01b8c3d307529b47AefaD2154C0e',
    foreignBridge: '0xb4005881e81a6ecd2c1f75d58e8e41f28d59c6b1',
    router: '0x47525293647C3725D911Cc0f6E000D2E831c4219',
    input: {
      symbol: 'WBNB',
      name: 'Wrapped BNB from BSC (Tokens Express)',
      address: '0x518076CCE3729eF1a3877EA3647a26e278e764FE',
      decimals: 18,
      networkOrigination: Chains.BNB,
      hostedNetwork: Chains.PLS,
    },
    output: {
      symbol: 'WBNB',
      name: 'Wrapped BNB',
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      decimals: 18,
      networkOrigination: Chains.BNB,
      hostedNetwork: Chains.BNB,
      native: {
        symbol: 'BNB',
        name: 'BNB',
      },
    },
  },
} as const

type BridgeKey = keyof typeof assets

export const bridgeKeys = Object.keys(assets) as BridgeKey[]

export const bridgeKey = derived([page], ([$page]) => $page.params.route as BridgeKey)

export const foreignSupportsEIP1559 = derived([bridgeKey], ([$bridgeKey]) =>
  $bridgeKey === 'BNB' ? false : true,
)
/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = writable(315_000n)
/** the block.baseFeePerGas on the latest block */
export const latestBaseFeePerGas = writable(0n)
/** the first recipient of the tokens (router) */
export const router = derived([bridgeKey], ([$bridgeKey]) => assets[$bridgeKey].router as viem.Hex)
/** the final destination of the tokens (user's wallet or other named address) */
export const destination = writable(viem.zeroAddress as viem.Hex)
/** whether or not to unwrap the tokens to their native value */
export const unwrap = writable(true)
/** the asset going into the home bridge */
export const assetIn = derived([bridgeKey], ([$bridgeKey]) => assets[$bridgeKey].input)
/** the asset coming out on the other side of the bridge (foreign) */
export const assetOut = derived([bridgeKey], ([$bridgeKey]) => {
  return assets[$bridgeKey].output
})
/** the direction of the bridge crossing */
export const fromNetwork = derived([bridgeKey], ([$bridgeKey]) =>
  $bridgeKey === 'ETH' ? Chains.PLS : Chains.PLS,
)
export const toNetwork = derived([bridgeKey], ([$bridgeKey]) =>
  $bridgeKey === 'ETH' ? Chains.ETH : Chains.BNB,
)

/** the number of tokens to push into the bridge (before fees) */
export const amountToBridge = writable(0n)
/** the maximum number of tokens that the user wishes to pay in fees */
export const limit = writable(0n)
/** a ratio (1+x)/1 ether of how much the user would like to pay on top of network fees */
export const incentiveFee = writable(0n)
/** the address of the bridge proxy contract on home */
export const bridgeAddress = derived(
  [bridgeKey],
  ([$bridgeKey]) => assets[$bridgeKey].homeBridge as viem.Hex,
)
export const foreignBridgeAddress = derived(
  [bridgeKey],
  ([$bridgeKey]) => assets[$bridgeKey].foreignBridge as viem.Hex,
)
/** the abi for the bridge */
export const inputBridgeAbi = viem.parseAbi([
  'function relayTokensAndCall(address token, address _receiver, uint256 _value, bytes memory _data) external',
  'function minPerTx(address token) external view returns(uint256)',
])
export const erc677abi = viem.parseAbi([
  'function transferAndCall(address, uint256, bytes calldata) external',
])
export const erc677abiBNB = viem.parseAbi([
  'function transferAndCall(address, uint256, bytes calldata, address sender) external',
])
export const outputRouterAbi = viem.parseAbi([
  'function onTokenBridged(address _token, uint256 _value, bytes memory _data) external payable',
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
export const amountAfterBridgeFee = derived(
  [amountToBridge, bridgeCost],
  ([$amountToBridge, $bridgeCost]) => {
    return $amountToBridge - $bridgeCost
  },
)
/** whether to use a fixed or gas based fee */
export const fixedFee = writable(false)
/** whether to use a fixed or gas based fee, the inverse of fixedFee */
export const gasBasedFee = derived([fixedFee], ([$fixedFee]) => !$fixedFee)

/**
 * the baseline, estimated cost for running a transaction
 * on the foreign network, given current gas conditions
 */
export const estimatedNetworkCost = derived(
  [estimatedGas, latestBaseFeePerGas],
  ([$estimatedGas, $latestBaseFeePerGas]) => {
    return $estimatedGas * $latestBaseFeePerGas
  },
)
export const incentiveRatio = derived([incentiveFee], ([$incentiveFee]) => oneEther + $incentiveFee)
/** the estimated network cost + tip */
export const baseFeeReimbersement = derived(
  [estimatedNetworkCost, incentiveRatio],
  ([$estimatedNetworkCost, $incentiveRatio]) => {
    return ($estimatedNetworkCost * $incentiveRatio) / oneEther
  }
)
/** the fee, clamped to the user defined limit */
export const clampedReimbersement = derived(
  [baseFeeReimbersement, limit],
  ([$baseFeeReimbersement, $limit]) => {
    return $baseFeeReimbersement > $limit ? $limit : $baseFeeReimbersement
  },
)
/** the estimated cost given the choice for a fixed fee, limit and incentive fee */
export const estimatedCost = derived(
  [fixedFee, limit, clampedReimbersement],
  ([$fixedFee, $limit, $clampedReimbersement]) => {
    return $fixedFee ? $limit : $clampedReimbersement
  },
)
/** the encoded struct to be passed to the foreign router */
export const feeDirectorStructEncoded = derived(
  [destination, fixedFee, limit, incentiveRatio],
  ([$destination, $fixedFee, $limit, $incentiveRatio]) => {
    return viem.encodeAbiParameters(viem.parseAbiParameters('(address, bool, uint256, uint256)'), [
      [$destination, $fixedFee, $limit, $incentiveRatio],
    ])
  }
)
/**
 * the full calldata defined in the home bridge's _data prop
 * to be used to call on the foreign router
 */
export const foreignData = derived(
  [router, feeDirectorStructEncoded],
  ([$router, $feeDirectorStructEncoded]) => {
    return viem.concatHex([$router, $feeDirectorStructEncoded])
  },
)
/**
 * the calldata that will be signed over by the user's wallet
 * this calldata transfers to the bridge address and the user's amount that they wish tob bridge before fees
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
  [bridgeKey, amountAfterBridgeFee, feeDirectorStructEncoded],
  ([$bridgeKey, $amountAfterBridgeFee, $feeDirectorStructEncoded]) =>
    viem.encodeFunctionData({
      abi: outputRouterAbi,
      functionName: 'onTokenBridged',
      args: [assets[$bridgeKey].output.address, $amountAfterBridgeFee, $feeDirectorStructEncoded],
    }),
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

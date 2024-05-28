import { derived, get, writable } from 'svelte/store'
import * as viem from 'viem'
import { multicall } from './auth/store'
import { Chains } from './auth/types'

type Settings = {
  bridge: viem.Hex
  feeH2F: bigint
  feeF2H: bigint
}

type BridgeFrom = Record<number, Record<number, Settings>>

export const bridgeFrom = writable({
  369: {
    1: {
      bridge: '0xba86ca0aeca30247f9e2fd8736879997bcd01dc4',
      feeH2F: 0n,
      feeF2H: 0n,
    },
  },
} as BridgeFrom)

export const assets = {
  ETH: {
    input: {
      symbol: 'WETH',
      name: 'Wrapped Ether from Ethereum',
      address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
      decimals: 18,
      networkOrigination: Chains.ETH,
    },
    output: {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      networkOrigination: Chains.ETH,
    },
  },
} as const

/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = writable(0n)
/** the block.baseFeePerGas on the latest block */
export const latestBaseFeePerGas = writable(0n)
/** the first recipient of the tokens (router) */
export const router = writable('0x5f542C3ce02a56586a91A7DE80deBF29947836eD' as viem.Hex)
/** the final destination of the tokens (user's wallet or other named address) */
export const destination = writable(viem.zeroAddress as viem.Hex)
/** whether or not to unwrap the tokens to their native value */
export const unwrap = writable(true)
/** the asset going into the home bridge */
export const assetIn = derived([], () => assets.ETH.input)
/** the asset coming out on the other side of the bridge (foreign) */
export const assetOut = derived([unwrap], ([$unwrap]) => {
  if ($unwrap) {
    return {
      ...assets.ETH.output,
      symbol: 'ETH',
      name: 'Ether',
      address: viem.zeroAddress,
    }
  } else {
    return assets.ETH.output
  }
})
/** the direction of the bridge crossing */
export const fromNetwork = writable(Chains.PLS)
export const toNetwork = writable(Chains.ETH)

/** the number of tokens to push into the bridge (before fees) */
export const amountToBridge = writable(0n)
/** the maximum number of tokens that the user wishes to pay in fees */
export const limit = writable(0n)
/** a ratio x/1 ether of how much the user would like to pay on top of network fees */
export const incentiveFee = writable(0n)
/** the address of the bridge proxy contract on home */
export const bridgeAddress = writable('0x4fD0aaa7506f3d9cB8274bdB946Ec42A1b8751Ef' as viem.Hex)
export const foreignBridgeAddress = writable('0x1715a3E4A142d8b698131108995174F37aEBA10D' as viem.Hex)
/** the abi for the bridge */
export const inputBridgeAbi = viem.parseAbi([
  'function relayTokensAndCall(address token, address _receiver, uint256 _value, bytes memory _data) external',
])
export const erc677abi = viem.parseAbi([
  'function transferAndCall(address, uint256, bytes calldata) external',
])
export const outputRouterAbi = viem.parseAbi([
  'function onTokenBridged(address _token, uint256 _value, bytes memory _data) external payable',
])
export const oneEther = 10n ** 18n

/** the number of tokens charged as fee for crossing the bridge */
export const bridgeCost = derived(
  [amountToBridge, bridgeFrom, fromNetwork, toNetwork],
  ([$amountToBridge, $bridgeFrom, $fromNetwork, $toNetwork]) => {
    return (
      ($amountToBridge * $bridgeFrom[Number($fromNetwork)][Number($toNetwork)].feeH2F) / oneEther
    )
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
export const incentiveRatio = derived([incentiveFee], ([$incentiveFee]) => (
  oneEther + $incentiveFee
))
/** the estimated network cost + tip */
export const baseFeeReimbersement = derived(
  [estimatedNetworkCost, incentiveRatio],
  ([$estimatedNetworkCost, $incentiveRatio]) =>
    ($estimatedNetworkCost * $incentiveRatio) / oneEther,
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
    return ($fixedFee ? $limit : $clampedReimbersement)
  },
)
/** the encoded struct to be passed to the foreign router */
export const feeDirectorStructEncoded = derived(
  [destination, fixedFee, limit, incentiveRatio],
  ([$destination, $fixedFee, $limit, $incentiveRatio]) =>
    viem.encodeAbiParameters(
      viem.parseAbiParameters('(address, bool, uint256, uint256)'),
      [[$destination, $fixedFee, $limit, $incentiveRatio]],
    ),
)
/**
 * the full calldata defined in the home bridge's _data prop
 * to be used to call on the foreign router
 */
export const foreignData = derived(
  [router, feeDirectorStructEncoded],
  ([$router, $feeDirectorStructEncoded]) => {
    return viem.concatHex([
      $router,
      $feeDirectorStructEncoded,
    ])
  },
)

export const calldata = derived(
  [bridgeAddress, foreignData, amountToBridge],
  ([$bridgeAddress, $foreignData, $amountToBridge]) => {
    return viem.encodeFunctionData({
      abi: erc677abi,
      functionName: 'transferAndCall',
      args: [
        $bridgeAddress,
        $amountToBridge,
        $foreignData,
      ],
    })
  },
)

export const foreignCalldata = derived(
  [amountAfterBridgeFee, feeDirectorStructEncoded],
  ([$amountAfterBridgeFee, $feeDirectorStructEncoded]) => (
    viem.encodeFunctionData({
      abi: outputRouterAbi,
      functionName: 'onTokenBridged',
      args: [
        assets.ETH.output.address,
        $amountAfterBridgeFee,
        $feeDirectorStructEncoded,
      ],
    })
  )
)

const feeManagerAbi = viem.parseAbi([
  'function HOME_TO_FOREIGN_FEE() public view returns(bytes32)',
  'function FOREIGN_TO_HOME_FEE() public view returns(bytes32)',
  'function getFee(bytes32, address) public view returns(uint256)',
])

export const loadFeeFor = async (fromId: number, toId: number) => {
  const settings = get(bridgeFrom)[fromId][toId]
  if (settings.feeH2F || settings.feeF2H) {
    return settings
  }
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
  const settingsFrom = (bf: BridgeFrom) => ({
    ...bf[fromId][toId],
    feeH2F: BigInt(feeH2F.returnData),
    feeF2H: BigInt(feeF2H.returnData),
  })
  bridgeFrom.update((bf) => ({
    ...bf,
    [fromId]: {
      ...bf[fromId],
      [toId]: settingsFrom(bf),
    },
  }))
  return settingsFrom(get(bridgeFrom))
}

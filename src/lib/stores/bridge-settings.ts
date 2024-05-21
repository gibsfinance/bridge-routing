import { derived, get, writable } from "svelte/store";
import * as viem from 'viem'
import { multicall } from "./auth/store"
import { Chains } from "./auth/types";

type Settings = {
  bridge: `0x${string}`;
  feeH2F: bigint;
  feeF2H: bigint;
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
      symbol: 'ETH',
      name: 'Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      networkOrigination: Chains.ETH,
    },
  },
} as const

export const estimatedGas = writable(0n)

export const latestBaseFeePerGas = writable(0n)

// export const estimatedCost = derived([estimatedGas, latestBaseFeePerGas], ([$estimatedGas, $latestBaseFeePerGas]) => $estimatedGas * $latestBaseFeePerGas)

export const recipient = writable(viem.zeroAddress as `0x${string}`)

export const unwrap = writable(true)

export const assetOut = derived([unwrap], ([$unwrap]) => {
  if ($unwrap) {
    return {
      ...assets.ETH.output,
      address: viem.zeroAddress,
    }
  } else {
    return {
      ...assets.ETH.output,
      symbol: 'WETH',
      name: 'Wrapped Ether',
    }
  }
})

export const fromNetwork = writable(Chains.PLS)
export const toNetwork = writable(Chains.ETH)

export const amountToBridge = writable(0n)

export const limit = writable(0n)

export const incentiveFee = writable(0n) // out of 1 eth

export const to = writable(viem.zeroAddress as `0x${string}`)

const inputRouterAbi = viem.parseAbi([
  'function relayTokensAndCall(address _receiver, bytes calldata _data) external payable',
])
const outputRouterAbi = viem.parseAbi([
  'function onTokenBridged(address _token, uint256 _value, bytes memory _data) external payable',
])

export const bridgeCost = derived([
  amountToBridge, bridgeFrom, fromNetwork, toNetwork,
], ([$amountToBridge, $bridgeFrom, $fromNetwork, $toNetwork]) => {
  return $amountToBridge * $bridgeFrom[Number($fromNetwork)][Number($toNetwork)].feeH2F / 10n ** 18n
})

export const amountAfterBridgeFee = derived([amountToBridge, bridgeCost], ([$amountToBridge, $bridgeCost]) => (
  $amountToBridge - $bridgeCost
))

export const fixedFee = writable(false)
export const gasBasedFee = derived([fixedFee], ([$fixedFee]) => !$fixedFee)

export const oneEther = 10n ** 18n

export const estimatedCost = derived([
  fixedFee, limit, estimatedGas, latestBaseFeePerGas, incentiveFee,
], ([$fixedFee, $limit, $estimatedGas, $latestBaseFeePerGas, $incentiveFee]) => (
  $fixedFee
    ? $limit
    : ($estimatedGas * $latestBaseFeePerGas * (oneEther + $incentiveFee)) / oneEther
))

export const feeManager = derived([
  recipient, fixedFee, limit, incentiveFee,
], ([$recipient, $fixedFee, $limit, $incentiveFee]) => (
  viem.encodePacked(
    ['address', 'bool', 'uint256', 'uint256'],
    [$recipient, $fixedFee, $limit, $incentiveFee],
  )
))

export const calldata = derived([
  amountAfterBridgeFee, to, feeManager
], ([$amountAfterBridgeFee, $to, $feeManager]) => {
  const routerCalldata = viem.encodeFunctionData({
    abi: outputRouterAbi,
    functionName: 'onTokenBridged',
    args: [
      assets.ETH.output.address,
      $amountAfterBridgeFee,
      $feeManager,
    ],
  })
  return viem.encodeFunctionData({
    abi: inputRouterAbi,
    functionName: 'relayTokensAndCall',
    args: [
      $to, routerCalldata,
    ],
  })
})

const feeManagerAbi = viem.parseAbi([
  'function HOME_TO_FOREIGN_FEE() public view returns(bytes32)',
  'function FOREIGN_TO_HOME_FEE() public view returns(bytes32)',
  'function getFee(bytes32, address) public view returns(uint256)',
])

export const loadFeeFor = async (h2f: boolean, fromId: number, toId: number) => {
  const settings = get(bridgeFrom)[fromId][toId]
  if (settings.feeH2F || settings.feeF2H) {
    return settings
  }
  const $multicall = get(multicall)
  const [keyH2F, keyF2H] = await $multicall.read.aggregate3([
    [{
      allowFailure: false,
      target: settings.bridge,
      callData: viem.encodeFunctionData({
        abi: feeManagerAbi,
        functionName: 'HOME_TO_FOREIGN_FEE',
      }),
    }, {
      allowFailure: false,
      target: settings.bridge,
      callData: viem.encodeFunctionData({
        abi: feeManagerAbi,
        functionName: 'FOREIGN_TO_HOME_FEE',
      }),
    }]
  ])
  const [feeH2F, feeF2H] = await $multicall.read.aggregate3([
    [{
      allowFailure: false,
      target: settings.bridge,
      callData: viem.encodeFunctionData({
        abi: feeManagerAbi,
        functionName: 'getFee',
        args: [keyH2F.returnData, viem.zeroAddress],
      }),
    }, {
      allowFailure: false,
      target: settings.bridge,
      callData: viem.encodeFunctionData({
        abi: feeManagerAbi,
        functionName: 'getFee',
        args: [keyF2H.returnData, viem.zeroAddress],
      }),
    }],
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

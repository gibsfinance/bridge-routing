import { derived, get, writable, type Stores, type Writable } from "svelte/store"
import * as abis from './abis'
import * as customTokens from './custom-tokens'
import { loading } from '$lib/stores/loading'
import { page } from '$app/stores'
import * as imageLinks from '$lib/stores/image-links'
import * as viem from 'viem'
import { humanReadableNumber, isZero, stripNonNumber } from '$lib/stores/utils'
import { parseUnits, zeroAddress } from "viem";
import { Chains, type DestinationChains } from "./auth/types";
import { feeManagerMapping } from "./fee-manager";
import { defaultAssetIn, destinationChains, nativeAssetOut } from "./config";
import type { Extensions, Token, TokenList } from "$lib/types";
import _ from "lodash"
import { chainsMetadata } from "./auth/constants"

const limitStore = writable('0')

let decimals = 18

export const setLimitDecimals = (d: number) => {
  decimals = d
}

const humanReadableSet = (store: Writable<string>) => (v: string) => {
  if (!v) {
    if (get(store)) {
      store.set(v)
    }
    return
  }
  let val = stripNonNumber(v)
  if (isZero(val)) {
    // the input is a string of zeros
    store.set(val)
    return
  }
  val = humanReadableNumber(parseUnits(val, decimals), decimals)
  if (get(store) === val) {
    return
  }
  store.set(val)
}

export const limit: Writable<string> = {
  ...limitStore,
  set: humanReadableSet(limitStore),
}

const amountInStore = writable('')

export const amountIn: Writable<string> = {
  ...amountInStore,
  set: humanReadableSet(amountInStore),
}

const feeStore = writable('0')

export const fee: Writable<string> = {
  ...feeStore,
  set: humanReadableSet(feeStore),
}

export enum FeeType {
  PERCENT = '%',
  GAS_TIP = 'gas+%',
  FIXED = 'fixed',
}

type FeeTypeKeys = keyof typeof FeeType

const feeTypeValToKeyMap = new Map<FeeType, FeeTypeKeys>(
  (Object.keys(FeeType) as FeeTypeKeys[]).map((key) => (
    [FeeType[key], key]
  ))
)

const feeTypeStore = writable<FeeType>(FeeType.PERCENT)
/** whether to use a fixed or gas based fee */
export const feeType = {
  ...feeTypeStore,
  set: (v: FeeType) => {
    if (!feeTypeValToKeyMap.get(v)) {
      throw new Error('invalid fee type')
    }
    feeTypeStore.set(v)
  },
}

const recipientStore = writable<viem.Hex>(zeroAddress)

export const recipient = {
  ...recipientStore,
}

export const bridgeFrom = writable(feeManagerMapping)

export const bridgeKeys = Object.keys(destinationChains) as DestinationChains[]

export const bridgeKey = derived([page], ([$page]) => (Chains[$page.params.bridgeKey as keyof typeof Chains] || Chains.ETH) as DestinationChains)

const extensions = new Map<string, Extensions>()

export const uniqueTokenKey = (t: Token) => `${Number(t.chainId)}-${viem.getAddress(t.address)}`

export const registerExtensions = (t: Token, tokenExts: Extensions | undefined) => {
  extensions.set(uniqueTokenKey(t), tokenExts as any)
}

export const getExtensions = (t: Token) => {
  return extensions.get(uniqueTokenKey(t))
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
      fetch(imageLinks.list('/pulsechain-bridge/foreign?extensions=bridgeInfo&chainId=369')),
      fetch(imageLinks.list('/tokensex-bridge/foreign?extensions=bridgeInfo&chainId=369')),
      fetch(imageLinks.list('/pulsechain-bridge/home?extensions=bridgeInfo&chainId=369')),
      fetch(imageLinks.list('/tokensex-bridge/home?extensions=bridgeInfo&chainId=369')),
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

export const assetInAddress = derived([bridgeKey, page], ([$bridgeKey, $page]) => (
  viem.getAddress($page.params.assetInAddress || defaultAssetIn[$bridgeKey as DestinationChains].address)
))

export const assetIn = derived(
  [assetInAddress, bridgeKey, bridgableTokens, customTokens.tokens],
  ([$assetInAddress, $bridgeKey, $bridgableTokens, $customTokens]) => {
    const $assetIn = _.find($bridgableTokens || [], {
      address: $assetInAddress,
    }) || _.find($customTokens || [], {
      address: $assetInAddress,
    }) || defaultAssetIn[$bridgeKey]
    return $assetIn
  })

const unwrapStore = writable(true)

export const unwrap = {
  ...unwrapStore,
}

export const isNative = ($asset: Token) => {
  if ($asset.chainId === Number(Chains.PLS)) {
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

export const bridgeFee = derived([bridgeFrom, bridgeKey], ([$bridgeFrom, $bridgeKey]) => (
  $bridgeFrom.get(Chains.PLS)!.get($bridgeKey)!.feeH2F
))

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

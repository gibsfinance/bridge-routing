import { derived, get, writable, type Writable } from 'svelte/store'
import * as abis from './abis'
import * as customTokens from './custom-tokens'
import { loading } from '$lib/stores/loading'
import { page } from '$app/stores'
import * as imageLinks from '$lib/stores/image-links'
import {
  type Hex,
  getAddress,
  type WalletClient,
  createPublicClient,
  http,
  getContract,
  multicall3Abi,
  encodeFunctionData,
  zeroAddress,
  parseUnits,
} from 'viem'
import { countDecimals, humanReadableNumber, isZero, stripNonNumber } from '$lib/stores/utils'
import { Chains, type DestinationChains } from './auth/types'
import { feeManagerMapping } from './fee-manager'
import { defaultAssetIn, destinationChains, nativeAssetOut } from './config'
import type { Token, TokenList } from '$lib/types'
import _ from 'lodash'
import { chainsMetadata } from './auth/constants'

export const forcedRefresh = writable(0n)

export const incrementForcedRefresh = () => forcedRefresh.update((current) => current + 1n)

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
  const val = stripNonNumber(v)
  if (isZero(val)) {
    // the input is a string of zeros
    store.set(val)
    return
  }
  const dec = countDecimals(v)
  const parsed = parseUnits(val, decimals)
  const readable = humanReadableNumber(parsed, decimals, dec)
  if (get(store) === readable) {
    return
  }
  store.set(readable)
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
  (Object.keys(FeeType) as FeeTypeKeys[]).map((key) => [FeeType[key], key]),
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

const recipientStore = writable<Hex>(zeroAddress)

export const recipient = {
  ...recipientStore,
}

export const bridgeFrom = writable(feeManagerMapping)

export const bridgeKeys = Object.keys(destinationChains) as DestinationChains[]

export const bridgeKey = derived(
  [page],
  ([$page]) => (Chains[$page.params.bridgeKey as keyof typeof Chains] || Chains.ETH) as DestinationChains,
)

export const bridgableTokens = writable<Token[]>([])
;(() => {
  const set = (tokens: Token[]) => {
    bridgableTokens.set(tokens)
  }
  loading.increment()
  Promise.all([
    fetch(imageLinks.list('/pulsechain-bridge/foreign?extensions=bridgeInfo&chainId=369')),
    fetch(imageLinks.list('/tokensex-bridge/foreign?extensions=bridgeInfo&chainId=369')),
    fetch(imageLinks.list('/pulsechain-bridge/home?extensions=bridgeInfo&chainId=369')),
    fetch(imageLinks.list('/tokensex-bridge/home?extensions=bridgeInfo&chainId=369')),
  ])
    .then(async (results) => {
      const responses = await Promise.all(results.map(async (r) => (await r.json()) as TokenList))
      loading.decrement()
      const list = _(responses)
        .map('tokens')
        .flatten()
        .keyBy(({ chainId, address }) => {
          return `${Number(chainId)}-${getAddress(address)}`
        })
        .values()
        .value()
      const check = (cId: DestinationChains) => (item: Token) =>
        defaultAssetIn[cId].address === item.address ? defaultAssetIn[cId] : null
      const checkETH = check(Chains.ETH)
      const checkBNB = check(Chains.BNB)
      const sortedList = _.sortBy(list, 'name').map((item) => checkETH(item) || checkBNB(item) || item)
      // console.log(sortedList)
      sortedList.forEach((token) => {
        // register on a central cache so that tokens that are gotten from onchain
        // still have all extensions
        // registerExtensions(token, token.extensions)
        if (!token.logoURI) {
          token.logoURI = imageLinks.image(token)
        }
      })
      set(sortedList)
      return sortedList
    })
    .catch((err) => {
      loading.decrement()
      throw err
    })
})()

export const assetInAddress = derived([bridgeKey, page], ([$bridgeKey, $page]) =>
  getAddress($page.params.assetInAddress || defaultAssetIn[$bridgeKey as DestinationChains].address),
)

export const assetIn = derived(
  [assetInAddress, bridgeKey, bridgableTokens, customTokens.tokens],
  ([$assetInAddress, $bridgeKey, $bridgableTokens, $customTokens]) => {
    const $assetIn = $bridgableTokens.length
      ? _.find($bridgableTokens || [], { address: $assetInAddress }) ||
        _.find($customTokens || [], { address: $assetInAddress }) ||
        defaultAssetIn[$bridgeKey]
      : null
    // console.log($assetIn)
    return $assetIn
  },
)

const unwrapStore = writable(true)

export const unwrap = {
  ...unwrapStore,
}

export const isNative = ($asset: Token | null) => {
  if (!$asset) return false
  if ($asset.chainId === Number(Chains.PLS)) {
    return !!Object.values(defaultAssetIn).find(
      ($defaultAssetIn) => getAddress($defaultAssetIn.address) === getAddress($asset.address),
    )
  } else {
    const chainId = `0x${$asset.chainId.toString(16)}` as DestinationChains
    return nativeAssetOut[chainId] === $asset.address
  }
}
export const canChangeUnwrap = derived([assetIn], ([$assetIn]) => !!$assetIn && isNative($assetIn))

export const activeChain = writable<Chains>(Chains.PLS)
export const walletClient = writable<WalletClient | undefined>()

export const clientFromChain = ($activeChain: Chains) => {
  return createPublicClient({
    chain: chainsMetadata[$activeChain],
    transport: http(chainsMetadata[$activeChain].rpcUrls.default.http[0], {
      batch: {
        wait: 10,
        batchSize: 10,
      },
    }),
  })
}

export const publicClient = derived(activeChain, clientFromChain)
export const multicall = derived([activeChain, publicClient], ([$activeChain, $publicClient]) => {
  const metadata = chainsMetadata[$activeChain]
  return getContract({
    abi: multicall3Abi,
    client: $publicClient,
    address: metadata.contracts!.multicall3!.address,
  })
})

export const bridgeFee = derived(
  [bridgeFrom, bridgeKey],
  ([$bridgeFrom, $bridgeKey]) => $bridgeFrom.get(Chains.PLS)!.get($bridgeKey)!.feeH2F,
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
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'HOME_TO_FOREIGN_FEE',
        }),
      },
      {
        allowFailure: false,
        target: settings.bridge,
        callData: encodeFunctionData({
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
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'getFee',
          args: [keyH2F.returnData, zeroAddress],
        }),
      },
      {
        allowFailure: false,
        target: settings.bridge,
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'getFee',
          args: [keyF2H.returnData, zeroAddress],
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

export const provider = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].provider)

export const foreignSupportsEIP1559 = derived([bridgeKey], ([$bridgeKey]) => ($bridgeKey === Chains.BNB ? false : true))
/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = writable(400_000n)
/** the first recipient of the tokens (router) */
export const router = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].router as Hex)
/** the address of the bridge proxy contract on home */
export const bridgeAddress = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].homeBridge as Hex)
export const foreignBridgeAddress = derived(
  [bridgeKey],
  ([$bridgeKey]) => destinationChains[$bridgeKey].foreignBridge as Hex,
)

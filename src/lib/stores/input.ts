import { derived, get, writable, type Writable } from 'svelte/store'
import * as rpcs from '$lib/stores/rpcs'
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
  fallback,
  type PublicClient,
} from 'viem'
import { countDecimals, humanReadableNumber, isZero, stripNonNumber } from '$lib/stores/utils'
import { ChainIdToKey, Chains, Provider } from './auth/types'
import { settings, type PathwayExtendableConfig } from './fee-manager'
import { defaultAssetIn, nativeAssetOut, pathway } from './config'
import type { Token, TokenList } from '$lib/types'
import _ from 'lodash'
import { chainsMetadata } from './auth/constants'
import { windowLoaded } from './window'
import { asyncDerived } from '@square/svelte-store'

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

export type BridgeKey = [Provider, Chains, Chains]

export const defaultBridgeKey = [
  Provider.PULSECHAIN,
  Chains.PLS,
  Chains.ETH,
] as BridgeKey

export const bridgeKey = writable<BridgeKey>(defaultBridgeKey)

export const partnerBridgeKey = derived([bridgeKey], ([$bridgeKey]) => (
  [$bridgeKey[0], $bridgeKey[2], $bridgeKey[1]] as BridgeKey
))

export const validBridgeKey = ([$bridgeKey]: [BridgeKey]) => (
  !!pathway($bridgeKey)
)

export const provider = derived([bridgeKey], ([$bridgeKey]) => $bridgeKey[0])
/** the direction of the bridge crossing */
export const fromNetwork = derived([bridgeKey], ([$bridgeKey]) => $bridgeKey[1])
export const fromChainId = derived([fromNetwork], ([$fromNetwork]) => $fromNetwork)
export const toNetwork = derived([bridgeKey], ([$bridgeKey]) => $bridgeKey[2])
export const toChainId = derived([toNetwork], ([$toNetwork]) => $toNetwork)

export const bridgePathway = derived([bridgeKey], ([$bridgeKey]) => pathway($bridgeKey))

export const bridgableTokensResponses = derived(
  [windowLoaded],
  ([$windowLoaded], set) => {
    let cancelled = false
    if (!$windowLoaded) {
      set([])
      return
    }
    loading.increment()
    Promise.all([
      fetch(imageLinks.list('/pulsechain-bridge/foreign?extensions=bridgeInfo')),
      fetch(imageLinks.list('/tokensex-bridge/foreign?extensions=bridgeInfo')),
      fetch(imageLinks.list('/pulsechain-bridge/home?extensions=bridgeInfo')),
      fetch(imageLinks.list('/tokensex-bridge/home?extensions=bridgeInfo')),
    ])
      .then(async (results) => {
        const responses = await Promise.all(results.map(async (r) => (await r.json()) as TokenList))
        loading.decrement()
        if (cancelled) return
        const list = _(responses)
          .map('tokens')
          .flatten()
          .keyBy(({ chainId, address }) => {
            return `${Number(chainId)}-${getAddress(address)}`
          })
          .values()
          .value()
        set(list)
      })
      .catch((err) => {
        loading.decrement()
        throw err
      })
    return () => {
      cancelled = true
    }
  },
  [] as Token[],
)

export const bridgableTokens = derived([bridgeKey, bridgableTokensResponses], ([$bridgeKey, $responses]) => {
  if (!$bridgeKey) return []
  const conf = pathway($bridgeKey)
  const defaultAssetIn = _.get(conf, ['defaultAssetIn']) as Token
  const sortedList = _($responses).sortBy('name').map((item) => {
    if (defaultAssetIn && defaultAssetIn.address === item.address) {
      return defaultAssetIn
    }
    return item
  }).filter((tkn) => tkn.chainId === Number($bridgeKey[1])).value()
  sortedList.forEach((token) => {
    // register on a central cache so that tokens that are gotten from onchain
    // still have all extensions
    // registerExtensions(token, token.extensions)
    if (!token.logoURI) {
      token.logoURI = imageLinks.image(token)
    }
  })
  return sortedList
})

export const assetInAddress = derived([bridgeKey, page], ([$bridgeKey, $page]) =>
  $bridgeKey && getAddress($page.params.assetInAddress || defaultAssetIn($bridgeKey)!.address),
)

export const assetIn = derived(
  [assetInAddress, bridgeKey, bridgableTokens, customTokens.tokens],
  ([$assetInAddress, $bridgeKey, $bridgableTokens, $customTokens]) => {
    const $assetIn = $bridgableTokens.length
      ? _.find($bridgableTokens || [], { address: $assetInAddress }) ||
      _.find($customTokens || [], { address: $assetInAddress }) ||
      defaultAssetIn($bridgeKey)
      : null
    return $assetIn as Token | null
  },
)

const unwrapStore = writable(true)

export const unwrap = {
  ...unwrapStore,
}

export const isNative = ($asset: Token | null, $bridgeKey: BridgeKey | null) => {
  if (!$bridgeKey || !$asset) {
    return false
  }
  if ($asset.chainId === Number(Chains.PLS)) {
    const $defaultAssetIn = defaultAssetIn($bridgeKey)
    if (!$defaultAssetIn) {
      return false
    }
    return getAddress($defaultAssetIn.address) === getAddress($asset.address)
  }
  const chainId = `0x${$asset.chainId.toString(16)}` as Chains
  return nativeAssetOut[chainId] === $asset.address
}
export const canChangeUnwrap = derived([assetIn, bridgeKey], ([$assetIn, $bridgeKey]) => !!$assetIn && isNative($assetIn, $bridgeKey))

export const walletClient = writable<WalletClient | undefined>()

const clientCache = new Map<Chains, { key: string; client: PublicClient }>([])

export const config = {
  batch: {
    wait: 10,
    batchSize: 10,
  },
}

export const clientFromChain = ($fromChainId: Chains) => {
  const urls = _.compact(get(rpcs.store).get($fromChainId) || [])
  const key = rpcs.key($fromChainId, urls)
  const existing = clientCache.get($fromChainId)
  if (existing && existing.key === key) {
    return existing.client
  }
  const client = createPublicClient({
    chain: chainsMetadata[$fromChainId],
    transport: fallback(
      urls.map((rpc) =>
        http(rpc, {
          batch: {
            wait: 10,
          },
        }),
      ),
      { rank: true },
    ),
  })
  clientCache.set($fromChainId, {
    key,
    client,
  })
  return client
}

export const fromPublicClient = derived([fromChainId, forcedRefresh], ([$fromChainId]) => clientFromChain($fromChainId))
export const toPublicClient = derived([toChainId, forcedRefresh], ([$toChainId]) => clientFromChain($toChainId))

export const fromChainMulticall = derived([fromChainId, fromPublicClient], ([$fromChainId, $publicClient]) => {
  const metadata = chainsMetadata[$fromChainId]
  return getContract({
    abi: multicall3Abi,
    client: $publicClient,
    address: metadata.contracts!.multicall3!.address,
  })
})

export const toChainMulticall = derived([toChainId, toPublicClient], ([$toChainId, $publicClient]) => {
  const metadata = chainsMetadata[$toChainId]
  return getContract({
    abi: multicall3Abi,
    client: $publicClient,
    address: metadata.contracts!.multicall3!.address,
  })
})

export const loadFeeFor = async ($bridgeKey: BridgeKey) => {
  if (!$bridgeKey) {
    return null
  }
  const s = settings.get($bridgeKey)
  const path = pathway($bridgeKey)
  if (!path || (s && s.feeManager)) {
    return s
  }
  loading.increment('fee')
  const $multicall = get(path.feeManager === 'from' ? fromChainMulticall : toChainMulticall)

  const [feeManagerResponse] = await $multicall.read.aggregate3([
    [{
      allowFailure: false,
      target: path[path.feeManager],
      callData: encodeFunctionData({
        abi: abis.inputBridge,
        functionName: 'feeManager',
      }),
    }]
  ])
  const { success, returnData } = feeManagerResponse
  if (!success) {
    throw new Error('unable to load feeManager')
  }
  if (returnData === '0x') {
    throw new Error('unable to read feeManager')
  }
  const feeManager = (returnData.startsWith('0x000000000000000000000000')
    ? `0x${returnData.slice(26)}`
    : `0x${returnData.slice(-40)}`) as Hex
  const [keyH2F, keyF2H] = await $multicall.read.aggregate3([
    [
      {
        allowFailure: false,
        target: feeManager,
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'HOME_TO_FOREIGN_FEE',
        }),
      },
      {
        allowFailure: false,
        target: feeManager,
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
        target: feeManager,
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'getFee',
          args: [keyH2F.returnData, zeroAddress],
        }),
      },
      {
        allowFailure: false,
        target: feeManager,
        callData: encodeFunctionData({
          abi: abis.feeManager,
          functionName: 'getFee',
          args: [keyF2H.returnData, zeroAddress],
        }),
      },
    ],
  ])
  const setting = {
    feeManager,
    feeH2F: BigInt(feeH2F.returnData),
    feeF2H: BigInt(feeF2H.returnData),
  } as PathwayExtendableConfig
  settings.set($bridgeKey, setting)
  loading.decrement('fee')
  return setting
}

export const bridgeFee = asyncDerived([bridgeKey], async ([$bridgeKey]) => {
  return loadFeeFor($bridgeKey)
})

export const destinationSupportsEIP1559 = derived([bridgeKey], ([$bridgeKey]) =>
  ($bridgeKey[2] === Chains.BNB ? false : true)
)
/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = writable(400_000n)
/** the first recipient of the tokens (router) */
export const router = derived([bridgeKey], ([$bridgeKey]) => pathway($bridgeKey)?.router || zeroAddress as Hex)
/** the address of the bridge proxy contract on home */
// export const bridgeAddress = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].homeBridge as Hex)
// export const foreignBridgeAddress = derived(
//   [bridgeKey],
//   ([$bridgeKey]) => destinationChains[$bridgeKey].to as Hex,
// )

export const toPath = ($bridgeKey: BridgeKey) => {
  const [provider, fromChain, toChain] = $bridgeKey
  return `${provider}/${ChainIdToKey.get(fromChain)!}/${ChainIdToKey.get(toChain)!}` as const
}

export const flippedTokenAddressIn = asyncDerived(
  [bridgeKey, assetInAddress, bridgableTokens],
  async ([$bridgeKey, $assetInAddress, $bridgableTokens]) => {
    const [, fromChain, toChain] = $bridgeKey
    const token = $bridgableTokens.find((tkn) => (
      getAddress(tkn.address) === getAddress($assetInAddress) && Number(fromChain) === tkn.chainId
    ))
    let known = token?.extensions?.bridgeInfo?.[Number(toChain)]?.tokenAddress
    if (!known) {
      // check at the bridge
      known = zeroAddress
    }
    return known
  },
)

export const flippedBridgeKey = derived([bridgeKey], ([$bridgeKey]) => {
  const provider = $bridgeKey[0]
  const fromChain = $bridgeKey[1]
  const toChain = $bridgeKey[2]
  return [provider, toChain, fromChain] as BridgeKey
})

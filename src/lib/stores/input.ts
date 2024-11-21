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
  webSocket,
} from 'viem'
import { countDecimals, humanReadableNumber, isZero, stripNonNumber } from '$lib/stores/utils'
import { ChainIdToKey, Chains, Provider } from './auth/types'
import { settings, type PathwayExtendableConfig } from './fee-manager'
import {
  defaultAssetIn,
  nativeAssetOut,
  nativeTokenName,
  nativeTokenSymbol,
  pathway,
} from './config'
import type { Token, TokenList, TokenOut } from '$lib/types'
import _ from 'lodash'
import { chainsMetadata } from './auth/constants'
import { windowLoaded } from './window'
import { multicallErc20 } from '$lib/utils'

export const forcedRefresh = writable(0n)

export const incrementForcedRefresh = () => forcedRefresh.update((current) => current + 1n)

// leave this here to help with testing. it is useful
// to be able to force a refresh to see what happens to the ui
// to see what is affected by incrementing this value
// ;(window as any).incrementForcedRefresh = incrementForcedRefresh

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

export const recipientLockedToAccount = writable(true)

export type BridgeKey = [Provider, Chains, Chains]

export const defaultBridgeKey = [Provider.PULSECHAIN, Chains.PLS, Chains.ETH] as BridgeKey

export const bridgeKey = writable<BridgeKey>(defaultBridgeKey)

export const partnerBridgeKey = derived(
  [bridgeKey],
  ([$bridgeKey]) => [$bridgeKey[0], $bridgeKey[2], $bridgeKey[1]] as BridgeKey,
)

export const validBridgeKey = ([$bridgeKey]: [BridgeKey]) => !!pathway($bridgeKey)

export const provider = derived([bridgeKey], ([$bridgeKey]) => $bridgeKey[0])
/** the direction of the bridge crossing */
export const fromChainId = derived([bridgeKey], ([$bridgeKey]) => $bridgeKey[1])
export const toChainId = derived([bridgeKey], ([$bridgeKey]) => $bridgeKey[2])

export const bridgePathway = derived([bridgeKey], ([$bridgeKey]) => pathway($bridgeKey))

export const bridgableTokensResponses = derived(
  [windowLoaded],
  ([$windowLoaded], set) => {
    // let cancelled = false
    set([])
    if (!$windowLoaded) {
      return
    }
    return loading.loadsAfterTick(
      null,
      async () => {
        return await Promise.all([
          fetch(imageLinks.list('/pulsechain-bridge/foreign?extensions=bridgeInfo')),
          fetch(imageLinks.list('/pulsechain-bridge/home?extensions=bridgeInfo')),
          fetch(imageLinks.list('/tokensex-bridge/foreign?extensions=bridgeInfo')),
          fetch(imageLinks.list('/tokensex-bridge/home?extensions=bridgeInfo')),
          fetch(imageLinks.list('/testnet-v4-pulsechain-bridge/foreign?extensions=bridgeInfo')),
          fetch(imageLinks.list('/testnet-v4-pulsechain-bridge/home?extensions=bridgeInfo')),
        ])
      },
      async (results: Response[]) => {
        return await Promise.all(results.map(async (r) => (await r.json()) as TokenList))
      },
      async (responses: TokenList[]) => {
        return _(responses)
          .map('tokens')
          .flatten()
          .keyBy(({ chainId, address }) => {
            return getAddress(address, Number(chainId))
          })
          .values()
          .value()
      },
      set,
    )
  },
  [] as Token[],
)

const blacklist = new Set<Hex>(['0xA882606494D86804B5514E07e6Bd2D6a6eE6d68A'])

export const bridgableTokens = derived(
  [bridgeKey, bridgableTokensResponses],
  ([$bridgeKey, $responses]) => {
    if (!$bridgeKey) return []
    const conf = pathway($bridgeKey)
    const defaultAssetIn = _.get(conf, ['defaultAssetIn']) as Token
    const sortedList = _($responses)
      .sortBy(['name', 'chainId'])
      .uniqBy(({ chainId, address }) => `${chainId}-${getAddress(address)}`)
      .map((item) => {
        if (defaultAssetIn && defaultAssetIn.address === item.address) {
          return defaultAssetIn
        }
        return item
      })
      .filter((tkn) => tkn.chainId === Number($bridgeKey[1]))
      .value()
    let list: Token[] = []
    if (sortedList.length) {
      const bridgedWrappedAssetOut = sortedList.find(
        (tkn) => tkn.address === nativeAssetOut[$bridgeKey[1]],
      )
      list = _([
        {
          chainId: Number($bridgeKey[1]),
          address: zeroAddress as Hex,
          name: nativeTokenName[$bridgeKey[1]],
          decimals: 18,
          symbol: nativeTokenSymbol[$bridgeKey[1]],
          logoURI: '',
          extensions: bridgedWrappedAssetOut
            ? {
                wrapped: {
                  address: bridgedWrappedAssetOut.address,
                },
                bridgeInfo: {
                  [Number($bridgeKey[2])]: {
                    tokenAddress:
                      bridgedWrappedAssetOut.extensions?.bridgeInfo?.[Number($bridgeKey[2])]
                        ?.tokenAddress,
                  },
                },
              }
            : null,
        } as Token,
      ])
        .concat(sortedList)
        .uniqBy(({ chainId, address }) => getAddress(address, chainId))
        .filter((tkn) => !blacklist.has(tkn.address))
        .value()
    }
    // console.log(list.slice(0, 2))
    list.forEach((token) => {
      // register on a central cache so that tokens that are gotten from onchain
      // still have all extensions
      // registerExtensions(token, token.extensions)
      if (!token.logoURI) {
        token.logoURI = imageLinks.image(token)
      }
    })
    return list
  },
)

export const assetInAddress = derived([bridgeKey, page], ([$bridgeKey, $page]) => {
  return (
    $bridgeKey && getAddress($page.params.assetInAddress || defaultAssetIn($bridgeKey)!.address)
  )
})

const unwrapStore = writable(true)

export const unwrap = {
  ...unwrapStore,
}

export const isNative = ($asset: Token | TokenOut | null, $bridgeKey: BridgeKey | null) => {
  if (!$bridgeKey || !$asset) {
    return false
  }
  return (
    ($asset.address === zeroAddress || !!nativeAssetOut[$asset.chainId as unknown as Chains]) &&
    !$asset.name.includes(' from Pulsechain')
  )
}
export const isUnwrappable = (
  $asset: Pick<Token, 'extensions'> | null,
  $bridgeKey: BridgeKey | null,
) => {
  if (!$bridgeKey || !$asset) {
    return false
  }
  const [, , toChain] = $bridgeKey
  return nativeAssetOut[toChain] === $asset.extensions?.bridgeInfo?.[Number(toChain)]?.tokenAddress
}
export const walletClient = writable<WalletClient | undefined>()

const clientCache = new Map<Chains, { key: string; client: PublicClient }>([])

export const config = {
  batch: {
    wait: 10,
    batchSize: 10,
  },
}

export const clientFromChain = ($chainId: Chains) => {
  const urls = _.compact(get(rpcs.store).get($chainId) || [])
  const key = rpcs.key($chainId, urls)
  const existing = clientCache.get($chainId)
  if (existing && existing.key === key) {
    return existing.client
  }
  const client = createPublicClient({
    chain: chainsMetadata[$chainId],
    transport: fallback(
      urls.map((rpc) =>
        rpc.startsWith('http')
          ? http(rpc, {
              batch: {
                wait: 10,
              },
            })
          : webSocket(rpc, {
              keepAlive: true,
              reconnect: true,
              retryDelay: 250,
              retryCount: 10,
              timeout: 4_000,
            }),
      ),
      { rank: true },
    ),
  })
  clientCache.set($chainId, {
    key,
    client,
  })
  return client
}

export const fromPublicClient = derived([fromChainId, forcedRefresh], ([$fromChainId]) =>
  clientFromChain($fromChainId),
)
export const toPublicClient = derived([toChainId, forcedRefresh], ([$toChainId]) =>
  clientFromChain($toChainId),
)

const getAsset = async ($chainId: Chains, $assetInAddress: Hex) => {
  if ($assetInAddress === zeroAddress) {
    return null
  }
  const asset = await multicallErc20({
    client: clientFromChain($chainId),
    chain: chainsMetadata[$chainId],
    target: $assetInAddress,
  }).catch(() => null)
  if (!asset) {
    console.log('getAsset failed', $assetInAddress)
    return null
  }
  const [name, symbol, decimals] = asset
  return {
    name,
    symbol,
    decimals,
    address: $assetInAddress,
    chainId: $chainId,
    logoURI: imageLinks.image({
      chainId: Number($chainId),
      address: $assetInAddress,
    }),
  }
}

export const assetIn = derived(
  [assetInAddress, bridgeKey, bridgableTokens, customTokens.tokens],
  ([$assetInAddress, $bridgeKey, $bridgableTokens, $customTokens], set) => {
    const $assetIn = $bridgableTokens.length
      ? _.find($bridgableTokens || [], { address: $assetInAddress }) ||
        _.find($customTokens || [], { address: $assetInAddress })
      : null
    if ($assetIn) {
      set($assetIn)
      return _.noop
    }
    set(null)
    return loading.loadsAfterTick(
      'assetIn',
      () => getAsset($bridgeKey[1], $assetInAddress),
      (result: Token | null) => {
        if (!result && $bridgableTokens.length) {
          return defaultAssetIn($bridgeKey)
        }
        return result
      },
      set,
    )
  },
  null as Token | null,
)

export const canChangeUnwrap = derived(
  [assetIn, bridgeKey],
  ([$assetIn, $bridgeKey]) => !!$assetIn && isUnwrappable($assetIn, $bridgeKey),
)

export const fromChainMulticall = derived(
  [fromChainId, fromPublicClient],
  ([$fromChainId, $publicClient]) => {
    const metadata = chainsMetadata[$fromChainId]
    return getContract({
      abi: multicall3Abi,
      client: $publicClient,
      address: metadata.contracts!.multicall3!.address,
    })
  },
)

export const toChainMulticall = derived(
  [toChainId, toPublicClient],
  ([$toChainId, $publicClient]) => {
    const metadata = chainsMetadata[$toChainId]
    return getContract({
      abi: multicall3Abi,
      client: $publicClient,
      address: metadata.contracts!.multicall3!.address,
    })
  },
)

export const loadFeeFor = async ($bridgeKey: BridgeKey) => {
  if (!$bridgeKey) {
    return null
  }
  const s = settings.get($bridgeKey)
  const path = pathway($bridgeKey)
  if (!path || (s && s.feeManager)) {
    return s
  }
  const $multicall = get(path.feeManager === 'from' ? fromChainMulticall : toChainMulticall)

  const [feeManagerResponse] = await $multicall.read.aggregate3([
    [
      {
        allowFailure: false,
        target: path[path.feeManager],
        callData: encodeFunctionData({
          abi: abis.inputBridge,
          functionName: 'feeManager',
        }),
      },
    ],
  ])
  const { success, returnData } = feeManagerResponse
  if (!success) {
    throw new Error('unable to load feeManager')
  }
  if (returnData === '0x') {
    throw new Error('unable to read feeManager')
  }
  const feeManager = (
    returnData.startsWith('0x000000000000000000000000')
      ? `0x${returnData.slice(26)}`
      : `0x${returnData.slice(-40)}`
  ) as Hex
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
  return setting
}

export const bridgeFee = derived(
  [bridgeKey],
  ([$bridgeKey], set) => {
    set(null)
    return loading.loadsAfterTick('fee', () => loadFeeFor($bridgeKey), set)
  },
  null as PathwayExtendableConfig | null,
)

export const destinationSupportsEIP1559 = derived([bridgeKey], ([$bridgeKey]) =>
  $bridgeKey[2] === Chains.BNB ? false : true,
)
/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = writable(400_000n)
/** the first recipient of the tokens (router) */
export const destinationRouter = derived(
  [bridgeKey],
  ([$bridgeKey]) => pathway($bridgeKey)?.destinationRouter || null,
)
/** the address of the bridge proxy contract on home */
// export const bridgeAddress = derived([bridgeKey], ([$bridgeKey]) => destinationChains[$bridgeKey].homeBridge as Hex)
// export const foreignBridgeAddress = derived(
//   [bridgeKey],
//   ([$bridgeKey]) => destinationChains[$bridgeKey].to as Hex,
// )

export const shouldDeliver = writable(true)

export const toPath = ($bridgeKey: BridgeKey) => {
  const [provider, fromChain, toChain] = $bridgeKey
  return `${provider}/${ChainIdToKey.get(fromChain)!}/${ChainIdToKey.get(toChain)!}` as const
}

// /**
//  * the address of the token coming out on the other side of the bridge (foreign)
//  * this address should only be used for presentational purposes
//  * to put this into the calldata would produce bad outcomes
//  */
// export const flippedTokenAddressIn = asyncDerived(
//   [bridgeKey, assetInAddress, bridgableTokens, unwrap],
//   async ([$bridgeKey, $assetInAddress, $bridgableTokens, $unwrap]) => {
//     const [, fromChain, toChain] = $bridgeKey
//     const assetInAddress = $assetInAddress === zeroAddress ? nativeAssetOut[fromChain] : getAddress($assetInAddress)
//     const token = $bridgableTokens.find(
//       (tkn) => getAddress(tkn.address) === assetInAddress && Number(fromChain) === tkn.chainId,
//     )
//     const known = token?.extensions?.bridgeInfo?.[Number(toChain)]?.tokenAddress
//     if (!known) {
//       // check at the bridge
//       return null
//     }
//     if (nativeAssetOut[toChain] === known && $unwrap) {
//       return zeroAddress
//     }
//     return known
//   },
// )

export const flipBridgeKey = ($bridgeKey: BridgeKey) => {
  const [provider, fromChain, toChain] = $bridgeKey
  return [provider, toChain, fromChain] as BridgeKey
}

export const flippedBridgeKey = derived([bridgeKey], ([$bridgeKey]) => flipBridgeKey($bridgeKey))

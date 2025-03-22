import * as rpcs from '$lib/stores/rpcs.svelte'
import { page } from '$app/state'
import * as abis from './abis'
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
  fallback,
  type PublicClient,
  webSocket,
  isAddress,
} from 'viem'
import { chainIdToKey, Chains, Provider, toChain } from './auth/types'
import { settingKey, settings, type PathwayExtendableConfig } from './fee-manager.svelte'
import {
  blacklist,
  defaultAssetIn,
  isProd,
  nativeAssetOut,
  nativeTokenName,
  nativeTokenSymbol,
  pathway,
  pathways,
  validBridgeKeys,
  type Pathway,
} from '$lib/stores/config.svelte'
import {
  NullableProxyStore,
  ProxyStore,
  type Token,
  type TokenList,
  type TokenOut,
} from '$lib/types.svelte'
import { chainsMetadata } from './auth/constants'
import { appkitNetworkList } from './auth/AuthProvider.svelte'
import _ from 'lodash'
import { loading } from './loading.svelte'
import * as networks from 'viem/chains'

export const forcedRefresh = new ProxyStore(0n)

export const incrementForcedRefresh = () => {
  forcedRefresh.value += 1n
}

export const limit = new NullableProxyStore<bigint>()

export const amountIn = new NullableProxyStore<bigint>()

export const oneEther = 10n ** 18n

export const basisPoints = 10_000n

export const percentFee = new NullableProxyStore<bigint>(null, (_, v) => {
  if (v === null) return v
  if (v > oneEther / 10n) return oneEther / 10n
  if (v < 0n) return 0n
  return v
})

export const gasTipFee = new NullableProxyStore<bigint>()

export const fixedFee = new NullableProxyStore<bigint>()

export const resetFeeInputs = () => {
  percentFee.value = null
  gasTipFee.value = null
  fixedFee.value = null
}

export enum FeeType {
  PERCENT = '%',
  GAS_TIP = 'gas+%',
  FIXED = 'fixed',
}

export type FeeTypeKeys = keyof typeof FeeType

export const feeTypeValToKeyMap = new Map<FeeType, FeeTypeKeys>(
  (Object.keys(FeeType) as FeeTypeKeys[]).map((key) => [FeeType[key], key]),
)

export const recipient = new ProxyStore<Hex>(zeroAddress)

export const recipientLockedToAccount = new ProxyStore<boolean>(true)

export type BridgeKey = [Provider, Chains, Chains]

export const defaultBridgeKey = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS] as BridgeKey

const getDefaultAssetInAddress = () => {
  const assetInAddress =
    page.params.assetInAddress || defaultAssetIn(defaultBridgeKey)?.address || null
  if (assetInAddress && isAddress(assetInAddress)) {
    return getAddress(assetInAddress)
  }
  return null
}

export class BridgeKeyStore {
  private val = $state(defaultBridgeKey)
  assetInAddress = $state(getDefaultAssetInAddress())
  get value() {
    return this.val
  }
  set value(v: BridgeKey) {
    if (!Array.isArray(v) || v.length !== 3) {
      throw new Error('invalid bridge key')
    }
    const allKeys = validBridgeKeys(isProd.value)
    if (!_.find(allKeys, (key) => _.isEqual(key, v))) {
      throw new Error('unknown bridge key')
    }
    this.val = v
  }
  get partner() {
    return [this.value[0], this.value[2], this.value[1]] as BridgeKey
  }
  get isValid() {
    return !!pathway(this.value)
  }
  get provider() {
    return this.value[0]
  }
  get fromChain() {
    return this.value[1]
  }
  get toChain() {
    return this.value[2]
  }
  get chain() {
    return chainIdToChain(this.fromChain)
  }
  get partnerChain() {
    return chainIdToChain(this.toChain)
  }
  get pathway() {
    return pathway(this.value)
  }
  // get settings() {
  //   return settings.get(this.value)
  // }
  get destinationSupportsEIP1559() {
    return this.toChain === Chains.BNB ? false : true
  }
  get destinationRouter() {
    return this.pathway?.destinationRouter || null
  }
  get path() {
    return toPath(this.value)
  }
}
export const bridgeKey = new BridgeKeyStore()

// export class AssetInAddressStore {
//   value = $state(page.params.assetInAddress || defaultAssetIn(bridgeKey.value)?.address || null)
// }
// export const assetInAddress = new NullableProxyStore<Hex>()

export const chainIdToChain = (chainId: Chains) => {
  const found = appkitNetworkList.find((n) => n.id === Number(chainId))!
  if (!found) {
    console.trace(chainId)
    throw new Error(`chainIdToChain: no network found for chainId: ${chainId}`)
  }
  return found
}

export const toPath = (bridgeKey: BridgeKey) => {
  const [provider, fromChain, toChain] = bridgeKey
  return `${provider}/${chainIdToKey.get(fromChain)!}/${chainIdToKey.get(toChain)!}` as const
}

export class BridgeableTokensStore {
  value = $state<Token[]>([])
  bridgeableTokensUnder(options: {
    chain: number
    partnerChain: number | null
    provider: Provider
  }) {
    return bridgeableTokensUnder({
      tokens: this.value,
      ...options,
    })
  }
  load() {
    return loadLists()
  }
}

const imageLists = [
  imageLinks.list('/pulsex'),
  imageLinks.list('/piteas'),
  imageLinks.list('/pls369'),
  imageLinks.list('/pulsechain-bridge/foreign?extensions=bridgeInfo'),
  imageLinks.list('/pulsechain-bridge/home?extensions=bridgeInfo'),
  imageLinks.list('/tokensex-bridge/foreign?extensions=bridgeInfo'),
  imageLinks.list('/tokensex-bridge/home?extensions=bridgeInfo'),
  imageLinks.list('/testnet-v4-pulsechain-bridge/foreign?extensions=bridgeInfo'),
  imageLinks.list('/testnet-v4-pulsechain-bridge/home?extensions=bridgeInfo'),
]
export const bridgableTokens = new BridgeableTokensStore()
const nativeAssets = Object.entries(chainsMetadata).map(([chain, metadata]) => {
  return {
    chainId: Number(chain),
    address: zeroAddress as Hex,
    ...metadata.nativeCurrency,
    logoURI: imageLinks.image({
      chainId: Number(chain),
      address: zeroAddress,
    }),
  }
})
export const loadLists = loading.loadsAfterTick<Token[] | null>(
  'loadLists',
  async (_input: undefined, c: AbortController) => {
    const opts = { signal: c.signal } as const
    return await Promise.all(imageLists.map((l) => fetch(l, opts)))
  },
  (lists: Response[]) => {
    return Promise.all(
      lists.map(
        async (r, index) =>
          (await r.json().catch((err) => {
            console.error('failed to load token list', imageLists[index])
            throw err
          })) as TokenList,
      ),
    )
  },
  (lists: TokenList[]): Token[] => {
    const tokens = _.uniqBy(
      _([
        ...nativeAssets,
        ..._(lists)
          .map('tokens')
          .flatten()
          .reduce((agg, t) => {
            const key = `${t.chainId}/${t.address}`.toLowerCase()
            let exists = agg.get(key)
            if (!exists) {
              agg.set(key, t)
              exists = t
            }
            if (!exists?.logoURI && t.logoURI) {
              exists.logoURI = t.logoURI
            }
            exists.extensions = _.merge(_.merge({}, exists.extensions ?? {}), t.extensions ?? {})
            return agg
          }, new Map<string, Token>())
          .values(),
      ])
        .sortBy((a) => {
          // put pulsechain -> foreign tokens last
          return a.name.toLowerCase().includes(' from pulsechain')
            ? 2
            : a.address === zeroAddress
              ? 0
              : 1
        })
        .value(),
      ({ chainId, address }) => `${chainId}/${address}`.toLowerCase(),
    )
    return tokens
  },
  // .map((t) => {
  //   return {
  //     ...t,
  //     logoURI: imageLinks.image(t),
  //   }
  // })
  // Object.values(
  //   _.keyBy(_.flatten(_.map(lists, 'tokens')), ({
  //     chainId,
  //     address,
  //   }) => {
  //     return getAddress(address, Number(chainId))
  //   }),
  // )
)
// should only be loaded once at the start of the app
const cancellableLoadLists = loadLists()
cancellableLoadLists.promise.then((tokens: Token[] | null) => {
  if (!tokens || cancellableLoadLists.controller.signal.aborted) {
    return
  }
  bridgableTokens.value = tokens
})

export const bridgeableTokensUnder = ({
  provider,
  tokens,
  chain,
  partnerChain,
}: {
  provider: Provider
  tokens: Token[]
  chain: number
  partnerChain: number | null
}) => {
  const grouping = [provider, toChain(chain)]
  const parentConf = _.get(pathways, grouping)
  if (!parentConf) {
    throw new Error('no pathway found')
  }
  const conf = partnerChain
    ? _.get(parentConf, [toChain(partnerChain)])
    : Object.values(parentConf)[0]

  if (!conf) throw new Error('no pathway found')
  const sortedList = _(tokens)
    .filter((tkn) => tkn.chainId === Number(chain))
    .value()
  let list: Token[] = []
  if (sortedList.length) {
    const bridgedWrappedAssetOut = sortedList.find(
      (tkn) => tkn.address === nativeAssetOut[toChain(chain)],
    )
    const tokenAddress =
      bridgedWrappedAssetOut?.extensions?.bridgeInfo?.[Number(partnerChain)]?.tokenAddress
    list = _.uniqBy(
      [
        {
          chainId: Number(chain),
          address: zeroAddress as Hex,
          name: nativeTokenName[toChain(chain)],
          decimals: 18,
          symbol: nativeTokenSymbol[toChain(chain)],
          extensions: !bridgedWrappedAssetOut
            ? null
            : {
                wrapped: {
                  address: bridgedWrappedAssetOut.address,
                },
                bridgeInfo: !partnerChain
                  ? null
                  : {
                      [Number(partnerChain)]: {
                        tokenAddress,
                      },
                    },
              },
        } as Token,
      ].concat(sortedList),
      ({ chainId, address }) => `${chainId}/${getAddress(address)}`,
    ).filter((tkn) => !blacklist.has(tkn.address as Hex))
  }
  return list
}

export const unwrap = new ProxyStore<boolean>(true)

export const isNative = (asset: Token | TokenOut | null, bridgeKey: BridgeKey | null) => {
  if (!bridgeKey || !asset) {
    return false
  }
  return (
    (asset.address === zeroAddress ||
      nativeAssetOut[toChain(asset.chainId)]?.toLowerCase() === asset.address?.toLowerCase()) &&
    !asset.name.includes(' from Pulsechain')
  )
}
export const isUnwrappable = (
  asset: Pick<Token, 'extensions'> | null,
  bridgeKey: BridgeKey | null,
) => {
  if (!bridgeKey || !asset) {
    return false
  }
  const [, , toChain] = bridgeKey
  return nativeAssetOut[toChain] === asset.extensions?.bridgeInfo?.[Number(toChain)]?.tokenAddress
}

export const walletClient = new NullableProxyStore<WalletClient>(null)

const clientCache = new Map<number, { key: string; client: PublicClient }>([])

export const defaultBatchConfig = {
  batch: {
    wait: 10,
    batchSize: 32,
  },
}

const chainList = [...Object.values(networks)]

const searchChainsForRpcUrls = (chainId: number) => {
  if (!chainId) {
    console.log(chainId)
    throw new Error('chainId is required')
  }
  const chain = chainList.find((c) => c.id === chainId)!
  const { http, webSocket = [] } = chain.rpcUrls.default as unknown as {
    http?: string[]
    webSocket?: string[]
  }
  return [...(http ?? []), ...(webSocket ?? [])]
}

export const clientFromChain = (chainId: number) => {
  const urls = _.compact(rpcs.store.get(chainId) || searchChainsForRpcUrls(chainId))
  const key = rpcs.key(chainId, urls)
  const existing = clientCache.get(chainId)
  if (existing && existing.key === key) {
    return existing.client
  }
  const chain = [...Object.values(networks)].find((chain) => chain.id === chainId)
  // if (chainId === 56) {
  //   console.trace()
  // }
  const transport = !urls?.length
    ? http()
    : fallback(
        urls.map((rpc) =>
          rpc.startsWith('http')
            ? http(rpc, {
                ...defaultBatchConfig,
              })
            : webSocket(rpc, {
                keepAlive: true,
                reconnect: true,
                retryDelay: 250,
                retryCount: 10,
                timeout: 4_000,
                ...defaultBatchConfig,
              }),
        ),
        { rank: true },
      )
  const client = createPublicClient({
    chain,
    transport,
  }) as PublicClient
  clientCache.set(chainId, {
    key,
    client,
  })
  return client
}

// export const fromPublicClient = (bridgeKey: BridgeKey) => clientFromChain(bridgeKey)

// export const toPublicClient = (bridgeKey: BridgeKey) => clientFromChain(toChainId(bridgeKey))

// export const getAsset = async (chainId: Chains, assetInAddress: Hex) => {
//   if (assetInAddress === zeroAddress) {
//     return null
//   }
//   const asset = await multicallErc20({
//     client: clientFromChain(chainId),
//     chain: chainsMetadata[chainId],
//     target: assetInAddress,
//   }).catch(() => null)
//   if (!asset) {
//     console.log('getAsset failed', assetInAddress)
//     return null
//   }
//   const [name, symbol, decimals] = asset
//   return {
//     name,
//     symbol,
//     decimals,
//     address: assetInAddress,
//     chainId: Number(chainId),
//     logoURI: imageLinks.image({
//       chainId: Number(chainId),
//       address: assetInAddress,
//     }),
//   } as Token
// }

// export const assetIn = new NullableProxyStore<Token>()

// export const updateAssetIn = async ({
//   bridgeKey,
//   assetInput,
//   customTokens,
// }: {
//   bridgeKey: BridgeKeyStore
//   assetInput: Token
//   customTokens: Token[]
// }) => {
//   const address = assetInAddress(bridgeKey.value, assetInput.address)
//   if (!address) {
//     return null
//   }
//   const tokensUnderBridgeKey = bridgableTokens(bridgeKey.value)
//   const foundAssetIn = tokensUnderBridgeKey.length
//     ? _.find(tokensUnderBridgeKey, { address }) || _.find(customTokens, { address })
//     : null
//   if (foundAssetIn) {
//     return foundAssetIn
//   }
//   return await getAsset(bridgeKey.fromChain, address)
// }

// export const assetIn = derived(
//   [assetInAddress, bridgeKey, bridgableTokens, customTokens.tokens],
//   ([$assetInAddress, $bridgeKey, $bridgableTokens, $customTokens], set) => {
//     const $assetIn = $bridgableTokens.length
//       ? _.find($bridgableTokens || [], { address: $assetInAddress }) ||
//         _.find($customTokens || [], { address: $assetInAddress })
//       : null
//     if ($assetIn) {
//       set($assetIn)
//       return _.noop
//     }
//     set(null)
//     return loading.loadsAfterTick(
//       'assetIn',
//       () => getAsset($chain, $assetInAddress),
//       (result: Token | null) => {
//         if (!result && $bridgableTokens.length) {
//           return defaultAssetIn($bridgeKey)
//         }
//         return result
//       },
//       set,
//     )
//   },
//   null as Token | null,
// )

export const canChangeUnwrap = (bridgeKey: BridgeKey, assetIn: Token | null) =>
  !!assetIn && isUnwrappable(assetIn, bridgeKey)

// export const canChangeUnwrap = derived(
//   [assetIn, bridgeKey],
//   ([$assetIn, $bridgeKey]) => !!$assetIn && isUnwrappable($assetIn, $bridgeKey),
// )

export const chainMulticall = (chainId: number) => {
  const metadata = chainsMetadata[toChain(chainId)]
  return getContract({
    abi: multicall3Abi,
    client: clientFromChain(chainId),
    address: metadata.contracts!.multicall3!.address,
  })
}

type InputLoadFeeFor = {
  value: BridgeKey
  fromChain: number
  toChain: number
  pathway: Pathway
}
export const loadFeeFor = loading.loadsAfterTick<PathwayExtendableConfig, InputLoadFeeFor>(
  'bridge-fee',
  async (bridgeKey: InputLoadFeeFor) => {
    if (!bridgeKey) {
      return null
    }
    const s = settings.get(settingKey(bridgeKey.value))
    const path = bridgeKey.pathway
    if (!path) {
      return null
    }
    if (s && s.feeManager) {
      return s
    }
    const multicall =
      path.feeManager === 'from'
        ? chainMulticall(bridgeKey.fromChain)
        : chainMulticall(bridgeKey.toChain)

    const [feeManagerResponse] = await multicall.read.aggregate3([
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
    const [keyH2F, keyF2H] = await multicall.read.aggregate3([
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
    const [feeH2F, feeF2H] = await multicall.read.aggregate3([
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
    settings.set(settingKey(bridgeKey.value), setting)
    return setting
  },
)

// export const bridgeAdminSettings = new NullableProxyStore<PathwayExtendableConfig>()

/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = new ProxyStore<bigint>(400_000n)

export const shouldDeliver = new ProxyStore<boolean>(true)

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

// export const flipBridgeKey = ($bridgeKey: BridgeKey) => {
//   const [provider, fromChain, toChain] = $bridgeKey
//   return [provider, toChain, fromChain] as BridgeKey
// }

// export const flippedBridgeKey = derived([bridgeKey], ([$bridgeKey]) => flipBridgeKey($bridgeKey))

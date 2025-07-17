import { chainKey, clientCache, clientFromChain as clientFromChainSDK } from '@gibs/common/client'
import { loadBridgeFees } from '@gibs/bridge-sdk/chain-info'
import { chainsMetadata } from '@gibs/bridge-sdk/chains'
import { chainIdToKey, Chains, Provider, toChain, pathway, pathways, validBridgeKeys, defaultAssetIn, nativeAssetOut, nativeTokenName, nativeTokenSymbol } from '@gibs/bridge-sdk/config'
import type { Token, TokenList, BridgeKey } from '@gibs/bridge-sdk/types'
import * as imageLinks from '@gibs/bridge-sdk/image-links'
import {
  type Hex,
  getAddress,
  type WalletClient,
  zeroAddress,
  isAddress,
  type PublicClient,
} from 'viem'
import _ from 'lodash'
import * as networks from 'viem/chains'

import * as rpcs from '../stores/rpcs.svelte'

import { page } from './app-page.svelte'
import { settingKey, settings, type PathwayExtendableConfig } from './fee-manager.svelte'
import {
  blacklist,
  isProd,
} from '../stores/config.svelte'
import {
  NullableProxyStore,
  ProxyStore,
} from '../types.svelte'
import { appkitNetworkList } from './auth/AuthProvider.svelte'
import { loading } from './loading.svelte'

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

export const recipientInput = new NullableProxyStore<string>()

export const recipient = new NullableProxyStore<Hex>()

export const recipientLockedToAccount = new ProxyStore<boolean>(true)

export const defaultBridgeKey = [Provider.PULSECHAIN, Chains.PLS, Chains.ETH] as BridgeKey

const getDefaultAssetInAddress = () => {
  const assetInAddress =
    page.params.assetInAddress || defaultAssetIn(defaultBridgeKey, isProd.value) || null
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
    return !!pathway(this.value, isProd.value, this.assetInAddress)
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
    return pathway(this.value, isProd.value, this.assetInAddress)
  }
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
    logoURI: null,
  }
})
export const tokenImageLookup = (token: { chainId: number, address: string, logoURI?: string | null }, bridgableTokens: Token[]) => {
  if (token.logoURI) {
    return token.logoURI
  }
  const found = bridgableTokens.find((t) => t.chainId === token.chainId && t.address === token.address)
  if (found) {
    return found.logoURI
  }
  return imageLinks.image({
    chainId: Number(token.chainId),
    address: token.address,
  })
}
export const loadLists = loading.loadsAfterTick<Token[] | null>(
  'loadLists',
  async (_input: undefined, c: AbortController) => {
    const opts = { signal: c.signal } as const
    return await Promise.all(
      imageLists.map((l) =>
        fetch(l, opts).then((r) => {
          if (!r.ok) {
            return fetch(l, opts)
          }
          return r
        }),
      ),
    )
  },
  (lists: Response[]) => {
    return Promise.all(
      lists.map(
        async (r, index) =>
          (await r.json().catch(() => {
            console.error('failed to load token list', imageLists[index])
            // throw err
            return {
              tokens: [],
            }
          })) as TokenList,
      ),
    )
  },
  (lists: TokenList[]): Token[] => {
    const tokens = _([
      ..._(lists)
        .map('tokens')
        .flatten()
        .filter((t) => !blacklist.has(getAddress(t.address as Hex)))
        .compact()
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
      ...nativeAssets,
    ])
      .sortBy((a) => {
        // put pulsechain -> foreign tokens last
        return a.name.toLowerCase().includes(' from pulsechain')
          ? 2
          : a.address === zeroAddress
            ? 0
            : 1
      })
      .value()
    return tokens
  },
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

const chainList = [...appkitNetworkList]

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

export const clientFromChain = (chainId: number): PublicClient => {
  const urls = _.compact(rpcs.store.get(chainId) || searchChainsForRpcUrls(chainId))
  const key = chainKey(chainId, urls)
  const existing = clientCache.get(chainId)
  if (existing && existing.key === key) {
    return existing.client
  }
  const chain = [...Object.values(networks)].find((chain) => chain.id === chainId)!
  const client = clientFromChainSDK({
    chain,
    urls,
  })
  clientCache.set(chainId, {
    key,
    client,
  })
  return client
}

export const loadFeeFor = loading.loadsAfterTick<PathwayExtendableConfig, BridgeKeyStore>(
  'bridge-fee',
  async (bridgeKey: BridgeKeyStore) => {
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
    const setting = await loadBridgeFees({
      pathway: path,
      fromChainClient: clientFromChain(Number(bridgeKey.fromChain)),
      toChainClient: clientFromChain(Number(bridgeKey.toChain)),
    })
    settings.set(settingKey(bridgeKey.value), setting)
    return setting
  },
)

/** the estimated gas that will be consumed by running the foreign transaction */
export const estimatedGas = new ProxyStore<bigint>(400_000n)

export const shouldDeliver = new ProxyStore<boolean>(true)

export const unwrap = new ProxyStore<boolean>(true)

export const walletClient = new NullableProxyStore<WalletClient>(null)

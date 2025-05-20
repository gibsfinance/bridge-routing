import * as input from './input.svelte'
import { multicallRead } from '../utils.svelte'
import * as abis from './abis'
import {
  getContract,
  erc20Abi,
  zeroAddress,
  parseAbi,
  getAddress,
  isHex,
  erc20Abi_bytes32,
  isAddress,
} from 'viem'
import type { Block, Hex, TransactionReceipt, BlockTag } from 'viem'
import { loading, resolved, type Cleanup } from './loading.svelte'
import { NullableProxyStore, type Token } from '../types.svelte'
import { bridgeGraphqlUrl, chainsMetadata } from './auth/constants'
import { nativeAssetOut, pathway } from './config.svelte'
import { SvelteMap } from 'svelte/reactivity'
import * as rpcs from './rpcs.svelte'
import _ from 'lodash'
import { untrack } from 'svelte'
import { Chains, toChain } from '../stores/auth/types'
import { tokenToPair } from './utils'
import { gql, GraphQLClient } from 'graphql-request'
import { Cache } from './cache'

export const watchFinalizedBlocksForSingleChain = (
  chainId: number,
  onBlock: (block: Block) => void,
) => {
  const client = input.clientFromChain(chainId)
  return client.watchBlocks({
    blockTag: 'finalized',
    emitOnBegin: true,
    emitMissed: true,
    onBlock,
  })
}

export const finalizedBlocks = new SvelteMap<number, bigint | null>()

export const watchFinalizedBlocksForOneChain = (chainId: number) => {
  return watchFinalizedBlocksForSingleChain(chainId, (v) => {
    untrack(() => finalizedBlocks.set(chainId, v.number))
  })
}

export const watchFinalizedBlocks = () =>
  Object.keys(chainsMetadata)
    .filter((chain) => rpcs.store.get(Number(chain)))
    .map((chain) => {
      const chainId = Number(chain)
      return watchFinalizedBlocksForSingleChain(chainId, (v) => {
        finalizedBlocks.set(chainId, v.number)
      })
    })

export const unwatchFinalizedBlocks = (cleanups: Cleanup[]) => {
  cleanups.forEach((cleanup) => cleanup())
}

const chainCounts = new Map<number, number>()
const watchers = new Map<number, Cleanup>()
export const blocks = new SvelteMap<number, Block | null>()
export const latestBaseFeePerGas = (chain: number) => {
  return blocks.get(chain)?.baseFeePerGas ?? 3_000_000_000n
}

export const blockWatcher = (blockTag: BlockTag) => (chain: number) => {
  if (!untrack(() => blocks.has(chain))) {
    // signals a "pending" state
    untrack(() => blocks.set(chain, null))
  }
  const current = chainCounts.get(chain) ?? 0
  let decrement: Cleanup = () => { }
  let cancelled = false
  if (current === 0) {
    untrack(() => loading.increment('gas'))
    decrement = _.once(() => {
      untrack(() => loading.decrement('gas'))
    })
    let watcher: Cleanup | null = null
    watcher = input.clientFromChain(chain).watchBlocks({
      emitOnBegin: true,
      emitMissed: true,
      blockTag,
      onBlock: (block) => {
        decrement()
        if (cancelled) return
        untrack(() => blocks.set(chain, block))
      },
    })
    watchers.set(chain, watcher)
  }
  chainCounts.set(chain, current + 1)
  return () => {
    decrement()
    cancelled = true
    const current = chainCounts.get(chain) ?? 0
    const next = current - 1
    chainCounts.set(chain, next)
    if (next === 0) {
      const watcher = watchers.get(chain)
      watcher?.()
      watchers.delete(chain)
    }
  }
}

export const latestBlock = blockWatcher('latest')
export const finalizedBlock = blockWatcher('finalized')

type TokenBalanceInputs = {
  chainId: number
  address: string | null
  account: string | null
}

export const getTokenBalance = ({ chainId, address, account }: TokenBalanceInputs) => {
  if (!address || !account) return null
  const key = tokenBalanceLoadingKey(chainId, address, account)
  let getBalance!: () => Promise<bigint | null>
  if (isHex(account)) {
    if (!isAddress(account)) {
      return null
    }
    const publicClient = input.clientFromChain(chainId)
    getBalance =
      address === zeroAddress
        ? () => publicClient.getBalance({ address: account })
        : () =>
          getContract({
            address: address as Hex,
            abi: erc20Abi,
            client: publicClient,
          })
            .read.balanceOf([account])
            .catch(() => {
              return getContract({
                address: address as Hex,
                abi: erc20Abi_bytes32,
                client: publicClient,
              }).read.balanceOf([account])
            })
            .catch(() => null)
  }
  return loading.loadsAfterTick<bigint | null>(key, getBalance)()
}

export const tokenBalanceLoadingKey = (chainId: number, address: string, account: string) => {
  return `balance-${chainId}-${address}-${account}`.toLowerCase()
}

// this is not the optimal way to do this, but these watchers
// should only be used for a heavily constrained set of cases
// the cases are being cleared on a regular interval
const balanceTTL = 1000 * 10
export const balances = new SvelteMap<string, { time: number; value: bigint | null }>()
export class TokenBalanceWatcher {
  private balanceCleanup: Cleanup | null = null
  private chainId: number | null = null
  private token: Token | null = null
  private walletAccount: string | null = null
  value = $state<bigint | null>(null)
  private clearLongtailBalances() {
    const now = Date.now()
    for (const [key, value] of balances.entries()) {
      if (now - value.time > balanceTTL || balances.size >= 100) {
        balances.delete(key)
      }
    }
  }
  cleanup() {
    if (!this.balanceCleanup) return
    this.balanceCleanup?.()
    this.balanceCleanup = null
    this.chainId = null
    this.token = null
    this.walletAccount = null
    this.clearLongtailBalances()
  }

  get key() {
    return `${this.chainId}-${this.walletAccount}-${this.token?.address}`.toLowerCase()
  }

  fetch({
    chainId,
    token,
    account,
    block: ticker,
  }: {
    chainId: number
    token: Token | null
    account: string | null
    block: Block | null | undefined
  }) {
    this.cleanup()
    this.chainId = chainId
    this.token = token
    this.walletAccount = account
    // console.log(token, account, ticker)
    // call this function whenever a new block is ticked over
    if (!ticker || !token || !account) {
      console.log(ticker, token, account)
      return () => { }
    }
    // const network = availableChains.get(chainId)
    // if (network) {
    const accountIsHex = isHex(account)
    const tokenIsHex = isHex(token?.address)
    if (/*network.chainType === 'EVM' && */ !accountIsHex || !tokenIsHex) {
      console.log(accountIsHex, tokenIsHex)
      return () => { }
      // } else if (network.chainType !== 'EVM' && (accountIsHex || tokenIsHex)) {
      //   return () => {}
    }
    // }
    const requestResult = getTokenBalance({
      chainId,
      address: token?.address,
      account,
    })
    if (!requestResult) {
      console.log('no request result')
      return () => { }
    }
    this.balanceCleanup = requestResult.cleanup
    
    requestResult.promise.then((v) => {
      if (requestResult.controller.signal.aborted) {
        this.value = null
        return () => { }
      }
      this.clearLongtailBalances()
      balances.set(this.key, { time: Date.now(), value: v })
      this.value = v
    })
    return () => {
      this.cleanup()
    }
  }
}

export const fromTokenBalance = new TokenBalanceWatcher()
export const toTokenBalance = new TokenBalanceWatcher()

export const minBridgeAmountIn = new SvelteMap<string, bigint | null>()
export const minBridgeAmountInKey = (bridgeKey: input.BridgeKey, assetIn: Token | null) => {
  return [...bridgeKey, assetIn?.address].join('-').toLowerCase()
}
export const fetchMinBridgeAmountIn = (bridgeKey: input.BridgeKey, assetIn: Token | null) => {
  // these clients should already be created, so we should not be doing any harm by accessing them
  const path = pathway(bridgeKey)
  if (!path || !assetIn) {
    return () => { }
  }
  const key = minBridgeAmountInKey(bridgeKey, assetIn)
  // this.value = null
  const result = loading.loadsAfterTick<bigint>('min-amount', () => {
    const fromPublicClient = input.clientFromChain(Number(bridgeKey[1]))
    const toPublicClient = input.clientFromChain(Number(bridgeKey[2]))
    const publicClient = path?.feeManager === 'from' ? fromPublicClient : toPublicClient
    return publicClient.readContract({
      abi: abis.inputBridge,
      functionName: 'minPerTx',
      args: [assetIn.address as Hex],
      address: path[path.feeManager],
    })
  })()
  result.promise.then((v) => {
    if (result.controller.signal.aborted) return
    minBridgeAmountIn.set(key, v)
  })
  return result.cleanup
}

const links = _.memoize(
  async ({ chainId, target, address }: { chainId: number; target: Hex; address: Hex }) => {
    return multicallRead<Hex[]>({
      client: input.clientFromChain(chainId),
      chain: chainsMetadata[toChain(chainId)],
      abi: abis.inputBridge,
      target,
      calls: [
        { functionName: 'bridgedTokenAddress', args: [address] },
        { functionName: 'nativeTokenAddress', args: [address] },
      ],
    })
  },
  ({ chainId, target, address }) => `${chainId}-${target}-${address}`.toLowerCase(),
)

export const tokenLinks = _.memoize(
  async ({ chainId, target, address }: { chainId: number; target: Hex; address: Hex }) => {
    return multicallRead<[Hex, Hex]>({
      client: input.clientFromChain(chainId),
      chain: chainsMetadata[toChain(chainId)],
      abi: abis.inputBridge,
      target,
      calls: [
        { functionName: 'homeTokenAddress', args: [address] },
        { functionName: 'foreignTokenAddress', args: [address] },
      ],
    })
  },
  ({ chainId, target, address }) => `${chainId}-${target}-${address}`.toLowerCase(),
)

export type TokenBridgeInfo = {
  originationChainId: Chains
  assetInAddress: Hex
  assetOutAddress: Hex | null
  toForeign?: {
    home: Hex
    foreign: Hex | null
  }
  toHome?: {
    home: Hex | null
    foreign: Hex
  }
}

export const tokenBridgeInfo = async (
  bridgeKey: input.BridgeKey,
  assetIn: Token | null,
): Promise<null | TokenBridgeInfo> => {
  const bridgePathway = pathway(bridgeKey)
  if (!assetIn || !bridgePathway) {
    console.log('missing asset in or bridge pathway')
    return null
  }
  const [, fromChain, toChain] = bridgeKey
  const assetInAddress =
    assetIn.address === zeroAddress ? nativeAssetOut[fromChain] : assetIn.address
  const [toMappings, fromMappings] = await Promise.all([
    links({
      chainId: Number(toChain),
      target: bridgePathway.to,
      address: assetInAddress as Hex,
    }),
    links({
      chainId: Number(fromChain),
      target: bridgePathway.from,
      address: assetInAddress as Hex,
    }),
  ])
  const [toBridged, toNative] = toMappings
  // const notGas = !Object.values(nativeAssetOut).find(
  //   (v) => v.toLowerCase() === assetInAddress.toLowerCase(),
  // )
  if (toBridged !== zeroAddress) {
    // if (notGas) console.log('toBridged')
    return {
      originationChainId: fromChain,
      assetInAddress: assetInAddress as Hex,
      assetOutAddress: toBridged,
      toForeign: {
        foreign: toBridged,
        home: assetInAddress as Hex,
      },
    }
  }
  if (toNative !== zeroAddress) {
    // if (notGas) console.log('toNative')
    return {
      originationChainId: toChain,
      assetInAddress: assetInAddress as Hex,
      assetOutAddress: toNative,
      toHome: {
        home: toNative,
        foreign: assetInAddress as Hex,
      },
    }
  }
  const [fromBridged, fromNative] = fromMappings
  if (fromNative !== zeroAddress) {
    // if (notGas) console.log('fromNative')
    return {
      originationChainId: toChain,
      assetInAddress: assetInAddress as Hex,
      assetOutAddress: fromNative,
      toHome: {
        home: assetInAddress as Hex,
        foreign: fromNative,
      },
    }
  }
  if (fromBridged !== zeroAddress) {
    // if (notGas) console.log('fromBridged')
    return {
      originationChainId: fromChain,
      assetInAddress: assetInAddress as Hex,
      assetOutAddress: fromBridged,
      toForeign: {
        foreign: fromBridged,
        home: assetInAddress as Hex,
      },
    }
  }
  // the token has not been bridged yet
  return {
    originationChainId: toChain,
    assetInAddress: assetInAddress as Hex,
    assetOutAddress: null,
    ...(bridgePathway.toHome
      ? {
        toHome: {
          foreign: assetInAddress as Hex,
          home: null,
        },
      }
      : {
        toForeign: {
          foreign: null,
          home: assetInAddress as Hex,
        },
      }),
  }
}

export const assetLink = new NullableProxyStore<TokenBridgeInfo>()
export const loadAssetLink = loading.loadsAfterTick<
  TokenBridgeInfo,
  {
    bridgeKey: input.BridgeKey
    assetIn: Token | null
  }
>('token', ({ bridgeKey, assetIn }: { bridgeKey: input.BridgeKey; assetIn: Token | null }) =>
  tokenBridgeInfo(bridgeKey, assetIn),
)
export const tokenOriginationChainId = (assetLink: TokenBridgeInfo | null) => {
  return assetLink?.originationChainId
}

const pairAbi = parseAbi([
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
])

const getReservesFailure = (chainId: number, token: Hex) => {
  return (e: unknown) => {
    console.error(`Failed to get reserves for id=${chainId} token=${token}`, e)
    return null
  }
}

const wpls = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27'

const retryCount = 3
const retry = async <T>(
  delay: number,
  fn: () => Promise<T>,
  catcher: (e: unknown) => void,
): Promise<T> => {
  for (let i = 0; i < retryCount; i++) {
    try {
      return await fn()
    } catch (e) {
      catcher(e)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error('Failed to complete operation')
}

type ReserveQuery<R> = {
  factory: Hex
  initCodeHash: Hex
  pair: Hex
  token0: Hex
  token1: Hex
  reserves: R | null
}

type KeyedReserveData = {
  wpls: bigint
  amount: bigint
  timestamp: number
}

const formatReserveQuery = (
  query: ReserveQuery<[bigint, bigint, number]> | null,
): ReserveQuery<KeyedReserveData> | null => {
  if (!query) {
    return null
  }
  const { token0, token1, reserves } = query
  if (!reserves) {
    return {
      ...query,
      reserves: null,
    }
  }
  const [rt0, rt1, timestamp] = reserves
  const wplsReserve = token0 === wpls ? rt0 : rt1
  const tokenReserve = token1 === wpls ? rt0 : rt1
  return {
    ...query,
    reserves: { wpls: wplsReserve, amount: tokenReserve, timestamp },
  }
}

export const getPoolInfo = async (chainId: number, token: Hex, block: Block) => {
  const client = input.clientFromChain(chainId)
  const factoryAndInitCodeHash = new Map<Hex, Hex>([
    [
      '0x1715a3E4A142d8b698131108995174F37aEBA10D',
      '0x59fffffddd756cba9095128e53f3291a6ba38b21e3df744936e7289326555d62',
    ],
    [
      '0x29eA7545DEf87022BAdc76323F373EA1e707C523',
      '0x5dff1ac2d132f5ac2841294c6e9fc0ebafae8d447fac7996ef21c21112f411f1',
    ],
  ])
  const [v1, v2] = await retry(
    100,
    () =>
      Promise.all(
        Array.from(factoryAndInitCodeHash.entries()).map(async ([factory, initCodeHash]) => {
          const [pair, token0, token1] = tokenToPair(token, wpls, factory, initCodeHash)
          const reserves = await getContract({
            abi: pairAbi,
            address: pair,
            client,
          })
            .read.getReserves({
              blockNumber: block.number!,
            })
            .catch(() => {
              return null
            })
          if (!reserves) {
            return null
          }
          return {
            factory: getAddress(factory) as Hex,
            initCodeHash,
            pair: getAddress(pair) as Hex,
            token0: getAddress(token0) as Hex,
            token1: getAddress(token1) as Hex,
            reserves,
          } as ReserveQuery<[bigint, bigint, number]>
        }),
      ),
    getReservesFailure(chainId, token),
  )
  const poolInfo = {
    v1: formatReserveQuery(v1),
    v2: formatReserveQuery(v2),
  }
  return poolInfo
}

type PoolInfo = {
  v1: ReserveQuery<KeyedReserveData> | null
  v2: ReserveQuery<KeyedReserveData> | null
}

export const loadPrice = (token: Token, block: Block) => {
  const key = `price-${token.chainId}-${token.address}`.toLowerCase()
  if (!block) {
    return resolved(null)
  }
  return loading.loadsAfterTick<PoolInfo>(key, () =>
    getPoolInfo(token.chainId, token.address as Hex, block),
  )()
}

const stableTokens = {
  DAI: {
    address: '0xefd766ccb38eaf1dfd701853bfce31359239f305',
    decimals: 18,
  },
  USDT: {
    address: '0x0cb6f5a34ad42ec934882a05265a7d5f59b51a2f',
    decimals: 6,
  },
  USDC: {
    address: '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07',
    decimals: 6,
  },
} as const
export const wplsPrice = new NullableProxyStore<bigint>()
const stableTokensList = Object.values(stableTokens)
export const watchWplsUSDPrice = loading.loadsAfterTick<bigint, Block>(
  'price-wpls',
  (block: Block) =>
    Promise.all(
      stableTokensList.map((token) => getPoolInfo(Number(Chains.PLS), token.address, block)),
    ),
  (results: PoolInfo[]) => {
    return (
      results.reduce((acc, poolInfo, i) => {
        const pi = poolInfo
        if (!pi) return acc
        const priceValue = priceInt(pi, stableTokensList[i].decimals)
        if (!priceValue) {
          return acc
        }
        return acc + priceValue
      }, 0n) / BigInt(stableTokensList.length)
    )
  },
)

// price is of
export const priceInt = (poolInfo: PoolInfo | null, decimals: number) => {
  if (!poolInfo) {
    return null
  }
  if (!poolInfo.v1 && !poolInfo.v2) {
    return null
  }
  const { v1, v2 } = poolInfo
  const wplsAmount = (v1?.reserves?.wpls ?? 0n) + (v2?.reserves?.wpls ?? 0n)
  const tokenAmount = (v1?.reserves?.amount ?? 0n) + (v2?.reserves?.amount ?? 0n)
  const decimalOffset = 10n ** BigInt(decimals)
  return (wplsAmount * decimalOffset) / tokenAmount
}

export const bridgeStatuses = {
  SUBMITTED: 'SUBMITTED',
  MINED: 'MINED',
  FINALIZED: 'FINALIZED',
  VALIDATING: 'VALIDATING',
  AFFIRMED: 'AFFIRMED',
} as const

export type BridgeStatus = keyof typeof bridgeStatuses
export type LiveBridgeStatusParams = {
  hash: Hex
  ticker: Block
  bridgeKey: input.BridgeKey
}
export type ContinuedLiveBridgeStatusParams = LiveBridgeStatusParams & {
  status: BridgeStatus
  statusIndex: number
  receipt?: TransactionReceipt
  finalizedBlock?: Block
  messageId?: Hex
  deliveredHash?: Hex
  count?: number
}
const statusList = Object.values(bridgeStatuses)
export const statusToIndex = (status: BridgeStatus) => {
  return statusList.indexOf(status)
}
const graphqlClient = _.memoize((url: string) => {
  return new GraphQLClient(url, {
    //
  })
})
type SingleUserRequest = {
  userRequests: {
    messageId: Hex
    message: {
      signatures: Hex[]
    }
  }[]
}
// assumes 1 bridge per transaction
const singleUserRequest = gql`
  query SingleUserRequest($hash: String!) {
    userRequests(where: { txHash: $hash }) {
      messageId
      message {
        signatures
      }
    }
  }
`
type SingleExecution = {
  executions: {
    txHash: Hex
  }[]
}
const singleExecution = gql`
  query SingleExecution($messageId: String!) {
    executions(where: { messageId: $messageId }) {
      txHash
    }
  }
`
type GqlRequest = {
  url: string
  query: string
  params?: Record<string, unknown>
}
const requestGraphql = ({ url, query, params }: GqlRequest) => {
  const client = graphqlClient(url)
  return client.request(query, params)
}
const gqlCache = new Cache(5 * 1_000)
const gqlRequest = _.wrap(requestGraphql, (fn, inputs: GqlRequest) => {
  const { url, query, params } = inputs
  const key = JSON.stringify([url, query, params])
  const now = gqlCache.clearStale()
  if (gqlCache.cache.has(key)) {
    return gqlCache.cache.get(key)!.value
  }
  const result = fn(inputs)
  gqlCache.cache.set(key, { time: now, value: result })
  return result
})
export const liveBridgeStatus = loading.loadsAfterTick<
  ContinuedLiveBridgeStatusParams,
  LiveBridgeStatusParams
>(
  'live-bridge-status',
  async (params: LiveBridgeStatusParams) => {
    const { hash, bridgeKey } = params
    const [, fromChain] = bridgeKey
    const client = input.clientFromChain(Number(fromChain))
    const receipt = await client
      .getTransactionReceipt({
        hash,
      })
      .catch(() => null)
    if (!receipt) {
      // tx has not yet been mined
      console.log('tx has not yet been mined', hash)
      return {
        ...params,
        status: bridgeStatuses.SUBMITTED,
      }
    }
    return {
      ...params,
      status: bridgeStatuses.MINED,
      receipt,
    }
  },
  async (params: ContinuedLiveBridgeStatusParams) => {
    if (!params) return null
    const { status, receipt, bridgeKey } = params
    const statusIndex = statusToIndex(status)
    if (statusIndex < statusToIndex(bridgeStatuses.MINED)) {
      return params
    }
    const urls = _.get(bridgeGraphqlUrl, bridgeKey)
    if (!urls) return null
    // where the signing happens
    const fromMainnetForeign = bridgeKey[1] === Chains.ETH
    const client = input.clientFromChain(Number(bridgeKey[1]))
    const [finalizedBlock] = await Promise.all([
      client.getBlock({
        blockTag: 'finalized',
      }),
    ])
    const blockNumber = finalizedBlock.number
    params.finalizedBlock = finalizedBlock
    if (blockNumber < receipt!.blockNumber) {
      console.log(
        'tx has been mined, not yet finalized hash=%o current=%o finalized=%o receipt=%o',
        receipt?.transactionHash,
        params.ticker.number,
        blockNumber,
        receipt!.blockNumber,
      )
      return params
    }
    const originationStatus = (await gqlRequest({
      url: fromMainnetForeign ? urls.foreign : urls.home,
      query: singleUserRequest,
      params: {
        hash: receipt!.transactionHash,
      },
    })) as SingleUserRequest
    console.log(originationStatus)
    if (!originationStatus.userRequests) {
      return params
    }
    const userRequest = originationStatus.userRequests?.[0]
    if (!finalizedBlock || !userRequest?.messageId) {
      return params
    }
    const count = !userRequest ? 0 : userRequest.message?.signatures?.length
    return {
      ...params,
      messageId: userRequest.messageId,
      status: bridgeStatuses.FINALIZED,
      count,
    }
  },
  async (params: ContinuedLiveBridgeStatusParams) => {
    if (!params) return null
    const { bridgeKey, messageId } = params
    if (params.status !== bridgeStatuses.FINALIZED || !messageId) {
      return params
    }
    const urls = _.get(bridgeGraphqlUrl, bridgeKey)
    if (!urls) return null
    // where the signing happens
    // const client = graphqlClient(urls.home)
    // should put this behind a ttl cache
    const fromMainnetForeign = bridgeKey[1] === Chains.ETH
    console.log('searching for execution', fromMainnetForeign, messageId)
    const result = await (
      gqlRequest({
        url: fromMainnetForeign ? urls.home : urls.foreign,
        query: singleExecution,
        params: {
          messageId,
        },
      }) as Promise<SingleExecution>
    ).catch((err) => {
      console.log(err)
      return {
        executions: [],
      }
    })
    console.log('executions', result)
    const { executions } = result
    if (executions[0]?.txHash) {
      return {
        ...params,
        status: bridgeStatuses.AFFIRMED,
        deliveredHash: executions[0].txHash,
      }
    } else {
      if (params.count === 5) {
        return {
          ...params,
          status: bridgeStatuses.AFFIRMED,
        }
      } else if ((params.count ?? 0) > 0) {
        return {
          ...params,
          status: bridgeStatuses.VALIDATING,
        }
      }
      return params
      // console.log('validating', messageId)
      // return {
      //   ...params,
      //   status: bridgeStatuses.VALIDATING,
      // }
    }
  },
)

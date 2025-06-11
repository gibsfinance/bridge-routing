import {
  type Chain,
  type PublicClient,
  type Hex,
  type Abi,
  getContract,
  multicall3Abi,
  encodeFunctionData,
  decodeFunctionResult,
  erc20Abi,
  erc20Abi_bytes32,
  getAddress,
} from 'viem'
import _ from 'lodash'
import type { Call } from '@gibsfinance/bridge-sdk/types'

export type Erc20Metadata = [string, string, number]

export const erc20MetadataCalls = [
  { functionName: 'name' },
  { functionName: 'symbol' },
  { functionName: 'decimals' },
]

export const multicallRead = async <T>({
  chain,
  client,
  abi,
  calls,
  target,
}: {
  chain: Chain
  client: PublicClient
  abi: Abi
  calls: Call[]
  target?: Hex
}) => {
  const multicall = getContract({
    abi: multicall3Abi,
    address: chain.contracts!.multicall3!.address!,
    client,
  })
  const arg = calls.map((call) => ({
    callData: encodeFunctionData({
      abi: call.abi || abi,
      functionName: call.functionName,
      args: call.args || [],
    }),
    allowFailure: call.allowFailure || false,
    target: (call.target || target) as Hex,
  }))
  let reads: null | Awaited<ReturnType<typeof multicall.read.aggregate3>> = null
  try {
    reads = await multicall.read.aggregate3([arg])
    if (!reads) throw reads
    const r = reads
    return calls.map((call, i) =>
      call.allowFailure
        ? r[i].success
          ? decodeFunctionResult({
            abi: call.abi || abi,
            functionName: call.functionName,
            data: r[i].returnData,
          })
          : r[i].returnData
        : decodeFunctionResult({
          abi: call.abi || abi,
          functionName: call.functionName,
          data: r[i].returnData,
        }),
    ) as T
  } catch (err) {
    console.log(client.chain?.id, target, calls, reads)
    throw err
  }
}

export const multicallErc20 = _.memoize(
  async ({ client, target, chain }: { client: PublicClient; target: Hex; chain: Chain }) => {
    const options = {
      chain: chain,
      client: client,
      abi: erc20Abi,
      target,
      calls: erc20MetadataCalls,
    }
    try {
      return await multicallRead<Erc20Metadata>(options)
    } catch {
      return await multicallRead<Erc20Metadata>({
        ...options,
        abi: erc20Abi_bytes32,
      })
    }
  },
  ({ target, chain }) => {
    return !target ? chain.id : getAddress(target, chain.id)
  },
)

export const nativeSymbol = (asset: { symbol: string } | null, unwrap = false) => {
  return asset ? (unwrap ? asset.symbol.slice(1) : asset.symbol) : ''
}

export const nativeName = (asset: { name: string } | null, unwrap = false) =>
  asset ? (unwrap ? asset.name.split('Wrapped ').join('') : asset.name) : ''

export class Proxy<T> {
  value = $state<T>(null as unknown as T)
  set(value: T) {
    this.value = value
  }
}

export class NullableProxy<T> extends Proxy<T | null> {
  value = $state(null)
}

/**
 * Memoize a function result and return a single value
 * @param fn the function to memoize
 * @param max the maximum number of values to cache
 * @returns the memoized function
 */
export const maxMemoize = <A extends unknown[], B>(fn: (...a: A) => B, max = 1024) => {
  const cache = new Map<string, B>()
  return (...a: A) => {
    const key = JSON.stringify(a, jsonAnyStringify)
    const existing = cache.get(key)
    if (cache.has(key)) {
      return existing
    }
    for (const k of cache.keys()) {
      if (cache.size < max) break
      cache.delete(k)
    }
    const result = fn(...a)
    cache.set(key, result)
    return result
  }
}

const hour1 = 1000 * 60 * 60
/**
 * Memoize a function result and return a single value
 * @param fn the function to memoize
 * @param ttl the time to live for the cache
 * @returns the memoized function
 */
export const ttlMemoizeSingle = <A extends unknown[], B>(fn: (...a: A) => B, ttl = hour1) => {
  let cache: {
    timestamp: number
    result: B
  } | null = null
  return (...a: A) => {
    const now = Date.now()
    if (cache && cache.timestamp + ttl > now) {
      return cache.result
    }
    const result = fn(...a)
    cache = { timestamp: now, result }
    return result
  }
}

const BIGINT_TYPE = 'bigint' as const
export const jsonAnyStringify = (key: string, value: unknown) => {
  if (typeof value === BIGINT_TYPE) {
    return {
      __type__: BIGINT_TYPE,
      value: (value as bigint).toString(),
    }
  }
  return value
}
type SerializedBigInt = {
  __type__: typeof BIGINT_TYPE
  value: string
}
export const isSerializedBigInt = (value: unknown): value is SerializedBigInt => {
  return (
    !!value && typeof value === 'object' && (value as SerializedBigInt).__type__ === BIGINT_TYPE
  )
}

export const jsonAnyParse = (_key: string, value: unknown) => {
  if (isSerializedBigInt(value)) {
    return BigInt(value.value)
  }
  return value
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

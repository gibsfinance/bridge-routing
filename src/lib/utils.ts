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
import * as types from './types'
import { memoize } from 'lodash'

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
  calls: types.Call[]
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

export const multicallErc20 = memoize(
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
    } catch (err) {
      return await multicallRead<Erc20Metadata>({
        ...options,
        abi: erc20Abi_bytes32,
      })
    }
  },
  ({ target, chain }) => getAddress(target, chain.id),
)

export const nativeSymbol = (asset: { symbol: string } | null, unwrap = false) =>
  asset ? (unwrap ? asset.symbol.slice(1) : asset.symbol) : ''

export const nativeName = (asset: { name: string } | null, unwrap = false) =>
  asset ? (unwrap ? asset.name.split('Wrapped ').join('') : asset.name) : ''

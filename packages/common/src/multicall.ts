import {
  type Chain,
  type PublicClient,
  type Hex,
  type Abi,
  getContract,
  encodeFunctionData,
  decodeFunctionResult,
  multicall3Abi,
} from 'viem'
import _ from 'lodash'
import type { Call } from './types.js'

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
    // this seems like a bug in viem, it should be able to infer the type of the client
    client: client as any,
  }) as any
  const arg = calls.map((call) => ({
    callData: encodeFunctionData({
      abi: call.abi || abi,
      functionName: call.functionName,
      // this seems like a bug in viem, it should be able to infer the type of the args
      args: (call.args || []) as any,
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

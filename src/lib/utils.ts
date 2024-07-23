import * as viem from 'viem'
import * as types from './types'

type Erc20Metadata = [string, string, number]

export const erc20MetadataCalls = [
  { functionName: 'name' },
  { functionName: 'symbol' },
  { functionName: 'decimals' },
]

export const multicallRead = async <T,>({
  chain,
  client,
  abi,
  calls,
  target,
}: {
  chain: viem.Chain
  client: ReturnType<typeof viem.createClient>
  abi: viem.Abi
  calls: types.Call[]
  target?: viem.Hex
}) => {
  const multicall = viem.getContract({
    abi: viem.multicall3Abi,
    address: chain.contracts!.multicall3!.address!,
    client,
  })
  const arg = calls.map((call) => ({
    callData: viem.encodeFunctionData({
      abi: call.abi || abi,
      functionName: call.functionName,
      args: call.args || [],
    }),
    allowFailure: call.allowFailure || false,
    target: (call.target || target) as viem.Hex,
  }))
  let reads: null | Awaited<ReturnType<typeof multicall.read.aggregate3>> = null
  try {
    reads = await multicall.read.aggregate3([arg])
    if (!reads) throw reads
    const r = reads
    return calls.map((call, i) =>
      call.allowFailure
        ? r[i].success
          ? viem.decodeFunctionResult({
            abi: call.abi || abi,
            functionName: call.functionName,
            data: r[i].returnData,
          })
          : r[i].returnData
        : viem.decodeFunctionResult({
          abi: call.abi || abi,
          functionName: call.functionName,
          data: r[i].returnData,
        }),
    ) as T
  } catch (err) {
    console.log(target, calls, reads)
    throw err
  }
}

export const multicallErc20 = async ({
  client,
  target,
  chain,
}: {
  client: viem.PublicClient
  target: viem.Hex
  chain: viem.Chain
}) => {
  const options = {
    chain: chain,
    client: client,
    abi: viem.erc20Abi,
    target,
    calls: erc20MetadataCalls,
  }
  try {
    return await multicallRead<Erc20Metadata>(options)
  } catch (err) {
    return await multicallRead<Erc20Metadata>({
      ...options,
      abi: viem.erc20Abi_bytes32,
    })
  }
}

export const nativeSymbol = (asset: types.Token, unwrap = false) =>
  unwrap ? asset.symbol.slice(1) : asset.symbol

export const nativeName = (asset: types.Token, unwrap = false) =>
  unwrap ? asset.name.split('Wrapped ').join('') : asset.name

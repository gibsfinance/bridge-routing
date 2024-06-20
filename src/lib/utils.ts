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
  const reads = await multicall.read.aggregate3([arg])
  return calls.map((call, i) =>
    call.allowFailure
      ? reads[i].success
        ? viem.decodeFunctionResult({
          abi: call.abi || abi,
          functionName: call.functionName,
          data: reads[i].returnData,
        })
        : reads[i].returnData
      : viem.decodeFunctionResult({
        abi: call.abi || abi,
        functionName: call.functionName,
        data: reads[i].returnData,
      }),
  ) as T
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
  try {
    return await multicallRead<Erc20Metadata>({
      chain: chain,
      client: client,
      abi: viem.erc20Abi,
      target,
      calls: erc20MetadataCalls,
    })
  } catch (err) {
    return await multicallRead<Erc20Metadata>({
      chain: chain,
      client: client,
      abi: viem.erc20Abi_bytes32,
      target,
      calls: erc20MetadataCalls,
    })
  }
}

export const nativeSymbol = (asset: types.Token) =>
  asset.symbol[0] === 'W' && asset.name.startsWith('Wrapped') ? asset.symbol.slice(1) : asset.symbol

export const nativeName = (asset: types.Token) =>
  asset.symbol[0] === 'W' && asset.name.startsWith('Wrapped') ? asset.name.split('Wrapped ').join('') : asset.name

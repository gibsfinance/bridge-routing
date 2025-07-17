import {
  type Chain,
  type PublicClient,
  type Hex,
  type Abi,
  erc20Abi,
  erc20Abi_bytes32,
  getAddress,
} from 'viem'
import _ from 'lodash'
import type { Erc20Metadata } from './types.js'
import { multicallRead } from './multicall.js'

/** The erc20 metadata calls */
export const erc20MetadataCalls = [
  { functionName: 'name' },
  { functionName: 'symbol' },
  { functionName: 'decimals' },
]

/** The multicall for the erc20 metadata */
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

import type { Abi, Hex } from "viem"

/** The inputs for a multicall read */
export type Call = {
  allowFailure?: boolean
  functionName: string
  target?: Hex
  abi?: Abi
  args?: (bigint | Hex | Hex[] | bigint[] | string | string[])[]
}

/** The erc20 metadata */
export type Erc20Metadata = [string, string, number]

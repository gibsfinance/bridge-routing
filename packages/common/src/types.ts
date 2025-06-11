import type { Abi, Hex } from "viem"

export type Call = {
  allowFailure?: boolean
  functionName: string
  target?: Hex
  abi?: Abi
  args?: (bigint | Hex | Hex[] | bigint[] | string | string[])[]
}
export type Erc20Metadata = [string, string, number]


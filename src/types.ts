import * as viem from 'viem'

export type Call = {
  allowFailure?: boolean
  functionName: string
  target?: viem.Hex
  abi?: viem.Abi
  args?: any[]
}

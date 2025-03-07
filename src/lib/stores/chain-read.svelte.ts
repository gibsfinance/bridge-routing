import { erc20Abi, type Hex } from 'viem'
import { clientFromChain } from './input.svelte'

export type ApprovalParameters = {
  token: Hex
  spender: Hex
  chainId: number
  account: Hex
}

export const checkAllowance = async ({
  token,
  spender,
  chainId,
  account,
}: ApprovalParameters) => {
  const client = clientFromChain(chainId)
  if (!account) {
    throw new Error('No account')
  }
  return await client.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account, spender],
  })
}

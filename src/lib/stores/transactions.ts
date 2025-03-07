import { sendTransaction as sendTransactionCore, waitForTransactionReceipt } from '@wagmi/core'
import { accountState, wagmiAdapter } from './auth/AuthProvider.svelte'
import {
  encodeFunctionData,
  erc20Abi,
  maxUint256,
  type Chain,
  type Hex,
  type SendTransactionParameters,
} from 'viem'

export const sendApproval = ({
  tokenAddress,
  spender,
  amount = maxUint256,
  chain,
}: {
  tokenAddress: Hex
  spender: Hex
  amount?: bigint
  chain: Chain
}) => {
  const opts = options(chain)
  return sendTransactionCore(wagmiAdapter.wagmiConfig, {
    ...opts,
    to: tokenAddress,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    }),
  })
}

export const options = (chain: Chain) => {
  const options = {
    account: accountState.address,
    type: 'eip1559',
    chain,
  } as const
  return options
}

export const sendTransaction = (opts: SendTransactionParameters) => {
  return sendTransactionCore(wagmiAdapter.wagmiConfig, opts)
}

export const wait = async (tx: Hex) => {
  return await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
    hash: tx,
  })
}

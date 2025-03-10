import {
  sendTransaction as sendTransactionCore,
  waitForTransactionReceipt,
  type SendTransactionParameters,
} from '@wagmi/core'
import { accountState, wagmiAdapter, connect } from './auth/AuthProvider.svelte'
import { encodeFunctionData, erc20Abi, maxUint256, zeroAddress, type Hex } from 'viem'
import { type ApprovalParameters, checkAllowance } from './chain-read.svelte'

export * from './chain-read.svelte'

export const sendApproval = ({
  token,
  spender,
  amount = maxUint256,
  chainId,
}: ApprovalParameters & { amount?: bigint }) => {
  const opts = options(chainId)
  return sendTransactionCore(wagmiAdapter.wagmiConfig, {
    ...opts,
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    }),
  })
}

export const checkAndRaiseApproval = async ({
  token,
  spender,
  chainId,
  raiseTo = maxUint256,
  minimum,
}: {
  token: Hex
  spender: Hex
  chainId: number
  raiseTo?: bigint
  minimum: bigint
}) => {
  if (token !== zeroAddress) {
    const approvalParams = {
      account: accountState.address!,
      spender: spender ?? zeroAddress,
      token,
      chainId: Number(chainId),
    }
    const approval = await checkAllowance(approvalParams)
    if (approval < minimum) {
      const tx = await sendApproval({ ...approvalParams, amount: raiseTo })
      await wait(tx)
    }
  }
}

export const options = (chainId: number) => {
  const options = {
    account: accountState.address,
    type: 'eip1559',
    chainId,
  } as const
  return options
}

export const sendTransaction = (opts: SendTransactionParameters) => {
  return sendTransactionCore(wagmiAdapter.wagmiConfig, opts).catch(async (err) => {
    if (err.message.includes('Connector not connected')) {
      await connect()
      return sendTransactionCore(wagmiAdapter.wagmiConfig, opts)
    }
    throw err
  })
}

export const wait = async (tx: Hex) => {
  return await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
    hash: tx,
  })
}

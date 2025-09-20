import {
  sendTransaction as sendTransactionCore,
  waitForTransactionReceipt,
  type SendTransactionParameters,
} from '@wagmi/core'
import { accountState, wagmiAdapter, connect } from './auth/AuthProvider.svelte'
import { encodeFunctionData, erc20Abi, maxUint256, zeroAddress, type Block, type Hex } from 'viem'
import { type ApprovalParameters, checkAllowance } from './chain-read.svelte'
import { loading } from './loading.svelte'

export * from './chain-read.svelte'

export const sendApproval = ({
  token,
  spender,
  amount = maxUint256,
  chainId,
  latestBlock,
}: ApprovalParameters & { amount?: bigint; latestBlock: Block }) => {
  const opts = options(chainId, latestBlock)
  const inputs = {
    ...opts,
    account: accountState.address as `0x${string}`,
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    }),
  }
  return sendTransactionCore(wagmiAdapter.wagmiConfig, inputs)
}

export const loadAllowance = loading.loadsAfterTick<bigint, ApprovalParameters>(
  'allowance',
  async (inputs: ApprovalParameters) => {
    const result = await checkAllowance(inputs).catch(() => {
      console.error('unable to load allowance', inputs)
      return 0n
    })
    return result
  },
)
export const checkAndRaiseApproval = async ({
  token,
  spender,
  chainId,
  raiseTo = maxUint256,
  minimum,
  latestBlock,
}: {
  token: Hex
  spender: Hex
  chainId: number
  raiseTo?: bigint
  minimum: bigint
  latestBlock: Block
}) => {
  if (token === zeroAddress) {
    return null
  }
  const approvalParams = {
    account: accountState.address! as Hex,
    spender: spender ?? zeroAddress,
    token,
    chainId: Number(chainId),
    latestBlock,
  }
  const approval = await checkAllowance(approvalParams)
  if (approval < minimum || approval === 0n) {
    if (approval === 0n) {
      raiseTo = maxUint256
    }
    return await sendApproval({ ...approvalParams, amount: raiseTo })
  }
  return null
}

export const options = (chainId: number, latestBlock: Block) => {
  const options = {
    account: accountState.address,
    type: 'eip1559',
    chainId,
    maxFeePerGas: latestBlock.baseFeePerGas! * 2n,
    maxPriorityFeePerGas: latestBlock.baseFeePerGas! / 5n,
  } as const
  return options
}

export const sendTransaction = async (opts: SendTransactionParameters) => {
  return await sendTransactionCore(wagmiAdapter.wagmiConfig, opts).catch(async (err) => {
    if (err.message.includes('Connector not connected')) {
      await connect()
      return sendTransactionCore(wagmiAdapter.wagmiConfig, opts)
    }
    throw err
  })
}

export const wait = async (tx: Hex, chainId: number) => {
  return await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
    hash: tx,
    chainId,
  })
}

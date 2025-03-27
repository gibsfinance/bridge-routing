import {
  sendTransaction as sendTransactionCore,
  waitForTransactionReceipt,
  type SendTransactionParameters,
} from '@wagmi/core'
import {
  accountState,
  wagmiAdapter,
  connect,
  modal,
} from './auth/AuthProvider.svelte'
import { encodeFunctionData, erc20Abi, maxUint256, zeroAddress, type Block, type Hex } from 'viem'
import { type ApprovalParameters, checkAllowance } from './chain-read.svelte'
import { loading } from './loading.svelte'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { PUBLIC_SOLANA_RPC_URL } from '$env/static/public'
import type { SolanaProvider } from '@lifi/sdk'

export * from './chain-read.svelte'

export const sendApproval = ({
  token,
  spender,
  amount = maxUint256,
  chainId,
  latestBlock,
}: ApprovalParameters & { amount?: bigint; latestBlock: Block }) => {
  const opts = options(chainId, latestBlock)
  return sendTransactionCore(wagmiAdapter.wagmiConfig, {
    ...opts,
    account: accountState.address as `0x${string}`,
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    }),
  })
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
  if (approval < minimum) {
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

const connection = new Connection(PUBLIC_SOLANA_RPC_URL!)
const opts = { commitment: 'confirmed' } as const

export const waitForSolanaTransaction = async (tx: string) => {
  const b = await connection.getBlockHeight(opts).then((v) => connection.getParsedBlock(v, opts))
  return await connection.confirmTransaction(
    {
      signature: tx,
      lastValidBlockHeight: b.blockHeight!,
      blockhash: b.blockhash!,
    },
    opts.commitment,
  )
}

export const sendTransactionSolana = async (encodedTx: { data: string }) => {
  const transaction = VersionedTransaction.deserialize(Buffer.from(encodedTx.data, 'base64'))
  const walletProvider = (await modal.getWalletProvider()) as SolanaProvider
  // @ts-expect-error does-not-exist
  const tx = await walletProvider.sendTransaction(transaction, connection, {
    skipPreflight: true,
    maxRetries: 10,
    ...opts,
  })
  return tx
}

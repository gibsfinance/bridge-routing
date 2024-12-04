import { decodeFunctionData, type Hex, type PublicClient, getContract } from 'viem'
import { pathway } from './config'
import { toChain } from './auth/types'
import { chainsMetadata } from './auth/constants'
import * as inputs from './input'
import { packSignatures, signatureToVRS } from './messages'
import * as abis from './abis'
import type { Bridge } from './history'
import type { Provider } from './auth/types'
import { get } from 'svelte/store'
import { walletAccount } from './auth/store'
import { walletClient } from './input'

export const deliverBridge = async (bridge: Bridge) => {
  const path = pathway([
    bridge.bridge?.provider! as unknown as Provider,
    toChain(bridge.originationChainId!),
    toChain(bridge.destinationChainId),
  ])
  if (!path) {
    return
  }
  const sigs = bridge.signatures?.items!
  const originationClient = inputs.clientFromChain(toChain(bridge.originationChainId))
  const destinationClient = inputs.clientFromChain(toChain(bridge.destinationChainId))
  const signatures = await getSignatures(
    originationClient,
    sigs.map((s) => s.transaction?.hash! as Hex),
  )
  const bridgeContract = await getContract({
    address: path.to,
    abi: abis.outputBridge,
    client: destinationClient,
  }).read.bridgeContract()
  const options = {
    account: get(walletAccount)!,
    type: 'eip1559' as const,
    chain: chainsMetadata[toChain(bridge.destinationChainId)],
  } as const
  const encodedData = bridge.encodedData as Hex
  const contract = getContract({
    address: bridgeContract,
    abi: abis.relayTokensDirect,
    client: get(walletClient)!,
  })
  return await contract.write.safeExecuteSignaturesWithAutoGasLimit(
    [encodedData, signatures],
    options,
  )
}

const getSignatures = async (client: PublicClient, hashes: Hex[]) => {
  const txs = await Promise.all(
    hashes.map((h) => {
      return client.getTransaction({ hash: h })
    }),
  )
  const sigs = txs.map((tx) => {
    const { args } = decodeFunctionData({
      abi: abis.homeAmb,
      data: tx.input,
    })
    const [signature] = args
    return signature
  })
  return packSignatures(sigs.map((s) => signatureToVRS(s))) as Hex
}

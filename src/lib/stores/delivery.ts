import { decodeFunctionData, type Hex, type PublicClient, getContract } from 'viem'
import { pathway } from '../stores/config.svelte'
import { toChain } from './auth/types'
import { chainsMetadata } from './auth/constants'
import * as inputs from './input.svelte'
import { packSignatures, signatureToVRS } from './messages'
import * as abis from './abis'
import type { Bridge } from './history'
import type { Provider } from './auth/types'

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

export const deliverBridge = async (account: Hex, bridge: Bridge) => {
  if (!bridge.bridge?.provider) {
    return
  }
  const path = pathway([
    bridge.bridge!.provider! as unknown as Provider,
    toChain(bridge.originationChainId!),
    toChain(bridge.destinationChainId),
  ])
  if (!path) {
    return
  }
  const sigs = bridge.confirmedSignatures!.items!
  const originationClient = inputs.clientFromChain(bridge.originationChainId)
  const destinationClient = inputs.clientFromChain(bridge.destinationChainId)
  const signatures = await getSignatures(
    originationClient,
    sigs.map((s) => s.transaction!.hash! as Hex),
  )
  const bridgeContract = await getContract({
    address: path.to,
    abi: abis.outputBridge,
    client: destinationClient,
  }).read.bridgeContract()
  const options = {
    account,
    type: 'eip1559' as const,
    chain: chainsMetadata[toChain(bridge.destinationChainId)],
  } as const
  const encodedData = bridge.encodedData as Hex
  const contract = getContract({
    address: bridgeContract,
    abi: abis.relayTokensDirect,
    client: inputs.walletClient.value!,
  })
  return await contract.write.safeExecuteSignaturesWithAutoGasLimit(
    [encodedData, signatures],
    options,
  )
}

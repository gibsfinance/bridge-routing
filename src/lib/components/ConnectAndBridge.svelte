<script lang="ts">
  import { formatUnits, type Hex, zeroAddress } from 'viem'
  import * as transactions from '../stores/transactions'
  import {
    accountState,
    appkitNetworkById,
    switchNetwork,
  } from '../stores/auth/AuthProvider.svelte'
  import { bridgeSettings } from '../stores/bridge-settings.svelte'
  import * as input from '../stores/input.svelte'
  import {
    assetLink,
    blocks,
    fromTokenBalance,
    minBridgeAmountIn,
    minBridgeAmountInKey,
  } from '../stores/chain-events.svelte'
  import { transactionButtonPress } from '../stores/transaction'
  import { connect } from '../stores/auth/AuthProvider.svelte'
  import { bridgeTx } from '../stores/storage.svelte'
  import Button from './Button.svelte'

  const { shouldDeliver } = input

  const tokenBalance = $derived(fromTokenBalance.value ?? 0n)
  const bridgeTokenIn = $derived(bridgeSettings.assetIn.value)
  const bridgeTokenOut = $derived(bridgeSettings.assetOut.value)
  const initiateBridge = $derived(async () => {
    if (!bridgeSettings.foreignDataParam) {
      return
    }
    if (!bridgeSettings.bridgePathway) {
      return
    }
    if (!assetLink.value || !bridgeTokenIn || !bridgeSettings.transactionInputs) {
      return
    }
    const chainId = Number(input.bridgeKey.fromChain)
    const latestBlock = blocks.get(chainId)?.get('latest')?.block
    if (!latestBlock) return null
    return await transactions.sendTransaction({
      ...bridgeSettings.transactionInputs,
      ...transactions.options(chainId, latestBlock),
      account: accountState.address as Hex,
    })
  })
  const sendIncreaseApproval = $derived(
    transactionButtonPress({
      chainId: Number(input.bridgeKey.fromChain),
      steps: [
        async () => {
          return transactions.checkAndRaiseApproval({
            token: bridgeTokenIn!.address as Hex,
            spender: bridgeSettings.bridgePathway!.from!,
            chainId: Number(input.bridgeKey.fromChain),
            minimum: bridgeSettings.amountToBridge,
            latestBlock: blocks.get(Number(input.bridgeKey.fromChain))?.get('latest')?.block!,
          })
        },
      ],
    }),
  )
  const decimals = $derived(bridgeTokenIn!.decimals)
  const sendInitiateBridge = $derived.by(() => {
    let amountInBefore = ''
    return transactionButtonPress({
      chainId: Number(input.bridgeKey.fromChain),
      steps: [
        async () => {
          amountInBefore = formatUnits(bridgeSettings.amountToBridge, decimals)
          const hash = await initiateBridge()
          bridgeTx.extend({
            hash,
            bridgeKey: input.bridgeKey.value,
          })
          return hash
        },
      ],
      after: () => {
        const previousAmount = formatUnits(bridgeSettings.amountToBridge!, decimals)
        if (amountInBefore === previousAmount) {
          input.amountIn.value = null
        }
      },
    })
  })
  const inputIsNative = $derived(bridgeTokenIn?.address === zeroAddress)
  const isBridgeToken = $derived(assetLink.value?.originationChainId !== input.bridgeKey.fromChain)
  const isRequiredChain = $derived(
    Number(accountState.chainId) === Number(input.bridgeKey.fromChain),
  )
  const hasSufficientApproval = $derived(
    !!bridgeSettings.approval.value &&
      bridgeSettings.approval.value >= bridgeSettings.amountToBridge,
  )
  const skipApproval = $derived.by(() => {
    return isBridgeToken || hasSufficientApproval || inputIsNative
  })
  const assetIn = $derived(bridgeTokenIn)
  const minAmount = $derived(
    minBridgeAmountIn.get(minBridgeAmountInKey(input.bridgeKey.value, assetIn)),
  )
  const disabled = $derived.by(() => {
    if (!accountState?.address) {
      return false
    }
    if (input.recipientInput.value !== input.recipient.value) {
      // console.log('recipient input mismatch', input.recipientInput.value, input.recipient.value)
      return true
    }
    if (!isRequiredChain) {
      return false
    }
    if (minAmount && input.amountIn.value && input.amountIn.value < minAmount) {
      return true
    }
    if (input.recipient.value === zeroAddress) {
      return true
    }
    if (!skipApproval) {
      if (bridgeSettings.amountToBridge === null || bridgeSettings.amountToBridge === 0n) {
        return true
      }
      return hasSufficientApproval
    }
    return !input.amountIn.value || input.amountIn.value > tokenBalance
  })
  const fromNetwork = $derived(appkitNetworkById.get(Number(input.bridgeKey.fromChain)))
  const toNetwork = $derived(appkitNetworkById.get(Number(input.bridgeKey.toChain)))
  const text = $derived.by(() => {
    if (!accountState?.address) {
      return 'Connect'
    }
    if (!isRequiredChain) {
      return `Switch Wallet to ${fromNetwork?.name}`
    }
    if (!skipApproval) {
      return `Approve ${assetIn?.symbol}`
    }
    const requiresDelivery = bridgeSettings.bridgePathway?.requiresDelivery
    if (!toNetwork) {
      return 'Bridge'
    }
    if (!assetIn) {
      return `Bridge to ${toNetwork.name}`
    }
    const suffix = `${bridgeTokenOut?.symbol ? ` ${bridgeTokenOut.symbol}` : ''} to ${toNetwork.name}`
    if ((!shouldDeliver.value && requiresDelivery) || !requiresDelivery) {
      return `Bridge${assetIn.symbol ? ` ${assetIn.symbol}` : ''}, as ${suffix}`
    }
    return `Bridge${assetIn.symbol ? ` ${assetIn.symbol}` : ''} + Deliver${suffix}`
  })
  const switchToChain = $derived(() =>
    switchNetwork(appkitNetworkById.get(Number(input.bridgeKey.fromChain))),
  )
  const onclick = $derived.by(() => {
    if (!accountState?.address) {
      return connect
    }
    if (!isRequiredChain) {
      return switchToChain
    }
    if (!skipApproval) {
      return sendIncreaseApproval
    }
    return sendInitiateBridge
  })
</script>

<div class="flex flex-row w-full relative">
  <Button
    class="bg-tertiary-600 w-full text-surface-contrast-950 leading-10 rounded-2xl p-2"
    {onclick}
    {disabled}>{text}</Button>
</div>

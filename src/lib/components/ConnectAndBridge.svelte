<script lang="ts">
  // import { chainsMetadata } from '../stores/auth/constants'
  import * as transactions from '../stores/transactions'
  import {
    accountState,
    appkitNetworkById,
    switchNetwork,
  } from '../stores/auth/AuthProvider.svelte'
  import { bridgeSettings } from '../stores/bridge-settings.svelte'
  import { formatUnits, type Hex, zeroAddress } from 'viem'
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
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
  import Button from './Button.svelte'
  import { bridgeTx } from '../stores/storage.svelte'

  const toast: ToastContext = getContext('toast')
  const { shouldDeliver } = input

  const tokenBalance = $derived(fromTokenBalance.value ?? 0n)
  const initiateBridge = async () => {
    if (!bridgeSettings.foreignDataParam) {
      return
    }
    if (!bridgeSettings.bridgePathway) {
      return
    }
    if (!assetLink.value || !bridgeSettings.assetIn.value || !bridgeSettings.transactionInputs) {
      return
    }
    const chainId = Number(input.bridgeKey.fromChain)
    const latestBlock = blocks.get(chainId)!
    return await transactions.sendTransaction({
      ...bridgeSettings.transactionInputs,
      ...transactions.options(chainId, latestBlock),
      account: accountState.address as Hex,
    })
  }
  let amountInBefore = ''
  const sendIncreaseApproval = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(input.bridgeKey.fromChain),
      steps: [
        async () => {
          return transactions.checkAndRaiseApproval({
            token: bridgeSettings.assetIn.value!.address as Hex,
            spender: bridgeSettings.bridgePathway!.from!,
            chainId: Number(input.bridgeKey.fromChain),
            minimum: bridgeSettings.amountToBridge,
            latestBlock: blocks.get(Number(input.bridgeKey.fromChain))!,
          })
        },
      ],
    }),
  )
  const decimals = $derived(bridgeSettings.assetIn.value!.decimals)
  const sendInitiateBridge = $derived(
    transactionButtonPress({
      toast,
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
    }),
  )
  const inputIsNative = $derived(bridgeSettings.assetIn.value?.address === zeroAddress)
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
  const minAmount = $derived(
    minBridgeAmountIn.get(
      minBridgeAmountInKey(input.bridgeKey.value, bridgeSettings.assetIn.value),
    ),
  )
  const disabled = $derived.by(() => {
    if (!accountState?.address) {
      return false
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
  const text = $derived.by(() => {
    if (!accountState?.address) {
      return 'Connect'
    }
    if (!isRequiredChain) {
      return 'Switch Network'
    }
    if (!skipApproval) {
      return 'Approve'
    }
    const requiresDelivery = bridgeSettings.bridgePathway?.requiresDelivery
    if ((!shouldDeliver.value && requiresDelivery) || !requiresDelivery) {
      return 'Bridge'
    }
    return 'Bridge and Deliver'
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

<div class="flex w-full">
  <Button
    class="bg-tertiary-600 w-full text-surface-contrast-950 leading-10 p-2 rounded-2xl"
    {onclick}
    {disabled}>{text}</Button>
</div>

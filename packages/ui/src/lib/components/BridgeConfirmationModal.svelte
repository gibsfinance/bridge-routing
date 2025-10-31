<script lang="ts">
  import { toChain } from '@gibs/bridge-sdk/config'
  import type { BridgeKey } from '@gibs/bridge-sdk/types'
  import Button from './Button.svelte'
  import BridgeProviderDirection from './BridgeProviderDirection.svelte'
  import { chainsMetadata } from '@gibs/bridge-sdk/chains'

  interface Props {
    bridgeKey: BridgeKey
    onClose: () => void
    onConfirm: () => void
  }

  const { bridgeKey, onClose, onConfirm }: Props = $props()
  const [provider, fromChainId, toChainId] = bridgeKey
  const fromChain = $derived(toChain(Number(fromChainId)))
  const toChainValue = $derived(toChain(Number(toChainId)))
  const from = $derived(chainsMetadata[fromChain])
  const to = $derived(chainsMetadata[toChainValue])
</script>

<div class="flex flex-col h-full gap-0 dark:text-surface-50">
  <h2 class="leading-10 text-2xl text-center flex flex-row items-center justify-center px-4 pt-4">
    <span>⚠️ Bridge Confirmation</span>
  </h2>
  <div class="overflow-y-scroll flex flex-col max-h-80 h-full px-4">
    <div class="text-surface-700 dark:text-surface-300 gap-2 flex flex-col py-2">
      <p class="text-center text-sm max-w-md mx-auto">
        This bridge transaction may require manual delivery.
      </p>
      <!-- <p class="text-sm">
        <strong>Important:</strong> You are about to initiate a bridge transaction that may require you
        to manually deliver your tokens to complete the transfer.
      </p> -->

      <div
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
        <strong>What this means:</strong>
        <ul class="text-xs text-yellow-700 dark:text-yellow-400 ml-4 list-disc">
          <li>Your tokens will be locked on the source chain</li>
          <li>You may need to manually deliver on the destination chain</li>
          <li>Gas fees may be required on the destination chain to deliver</li>
        </ul>
      </div>

      <div
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2">
        <ul class="text-xs mt-0 text-blue-700 dark:text-blue-300 ml-4 list-disc">
          <li>Increase the delivery fee for better executor compensation</li>
          <li>Bridge a larger amount to make delivery more economical</li>
          <li>Switch to "Gas Tip" for automatic executor compensation</li>
          <li>Wait for lower network congestion to reduce delivery costs</li>
        </ul>
      </div>

      <!-- {#if fromNetworkName && toNetworkName} -->
      <div class="flex flex-row gap-2 items-center justify-between pointer-events-none">
        <p class="text-xs text-surface-600 dark:text-surface-400">
          Bridging from <strong>{from.name}</strong> to <strong>{to.name}</strong>
        </p>
        <BridgeProviderDirection {fromChain} toChain={toChainValue} {provider} />
      </div>
      <!-- {/if} -->
    </div>
  </div>
  <div class="flex flex-row gap-2 p-4 border-t border-surface-200 dark:border-surface-700">
    <Button
      class="flex w-1/2 text-center justify-center border border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600 text-surface-950 dark:text-surface-50 leading-6 p-2 rounded-2xl font-semibold hover:shadow transition-all duration-100"
      onclick={onClose}>Cancel</Button>
    <Button
      class="flex w-1/2 text-center justify-center bg-green-600 text-white leading-6 p-2 rounded-2xl font-semibold hover:bg-green-700 hover:shadow transition-all duration-100"
      onclick={onConfirm}>Accept</Button>
  </div>
</div>

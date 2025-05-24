<script lang="ts">
  import { zeroAddress } from 'viem'
  import { bridgeSettings } from '../stores/bridge-settings.svelte'
  import * as input from '../stores/input.svelte'
  import ButtonToggle from './ButtonToggle.svelte'

  const { bridgeKey } = input
  const nonZeroXCalldata = $derived(bridgeSettings.transactionInputs?.data?.slice(2) || '')
  const canUnwrap = $derived(input.canChangeUnwrap(bridgeKey.value, bridgeSettings.assetIn.value))
</script>

<div class="flex flex-col gap-1 text-sm mt-1">
  {#if bridgeKey.destinationRouter}
    <div
      class="leading-6 justify-between flex flex-col sm:flex-row sm:items-center disabled cursor-not-allowed relative">
      <span>Router</span>
      <span class="font-mono text-xs">{bridgeKey.destinationRouter}</span>
    </div>
  {/if}
  {#if canUnwrap}
    <div class="leading-6 justify-between flex flex-row items-center">
      <ButtonToggle
        title="Unwrap"
        contentClass="leading-6 sm:text-sm"
        checked={input.unwrap.value}
        onclick={() => {
          input.unwrap.value = !input.unwrap.value
        }}>Unwrap</ButtonToggle>
    </div>
  {/if}
  <div
    class="leading-6 justify-between flex flex-col sm:flex-row sm:items-center disabled cursor-not-allowed"
    class:rounded-b-lg={!nonZeroXCalldata}>
    <span>To (Bridge)</span>
    <span class="font-mono text-xs">{bridgeKey.pathway?.to || zeroAddress}</span>
  </div>
  {#if nonZeroXCalldata}
    <div
      class="rounded-b-lg leading-4 justify-between flex flex-col sm:flex-row cursor-not-allowed">
      <span class="flex flex-row items-start justify-between whitespace-pre"
        >Data &nbsp;&nbsp;<span class="font-mono text-xs">0x</span></span>
      <textarea
        name="calldata"
        id="calldata"
        disabled
        class="bg-transparent !opacity-100 text-surface-contrast-50 border-none outline-hidden resize-none flex grow cursor-not-allowed font-mono text-xs -mr-3 pr-2 p-0 max-h-24"
        rows={4}>{nonZeroXCalldata}</textarea>
    </div>
  {/if}
</div>

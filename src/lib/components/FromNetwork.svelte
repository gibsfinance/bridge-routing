<script lang="ts">
  import NetworkSummary from './NetworkSummary.svelte'
  import { formatUnits } from 'viem'
  import type { VisualChain } from '$lib/stores/auth/types'
  import { writable, type Writable } from 'svelte/store'
  import { amountToBridge } from '$lib/stores/bridge-settings'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import Warning from './Warning.svelte'
  import Icon from '@iconify/svelte'
  import * as modalStore from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import type { FormEventHandler } from 'svelte/elements'
  import { tokenBalance, minAmount } from '$lib/stores/chain-events'

  export let network!: VisualChain
  export let asset!: Token
  export let value!: Writable<string>
  // when asset changs, reset to zero
  $: if (asset) {
    value.set('')
  }
  const focused = writable(false)
  const openModal = () => {
    modalStore.type.set('choosetoken')
  }
  const handleInput: FormEventHandler<HTMLInputElement> = (e) => {
    value.set(e.currentTarget.value)
  }
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg">
    <NetworkSummary
      {network}
      {asset}
      balance={$tokenBalance}
      showMax
      on:max-balance={() => {
        const updated = formatUnits($tokenBalance, asset.decimals)
        value.set(updated)
      }} />
  </div>
  <div class="flex flex-row mt-[1px] bg-slate-100 rounded-b-lg text-xl justify-between">
    <span class="flex flex-grow relative max-w-[70%]">
      <input
        class="bg-transparent leading-8 outline-none px-3 py-2 placeholder-current hover:appearance-none focus:shadow-inner flex-grow text-xl sm:text-2xl w-full"
        placeholder="0.0"
        value={$value}
        on:focus={() => focused.set(true)}
        on:blur={() => focused.set(false)}
        on:input={handleInput} />
      <Warning
        show={$amountToBridge < $minAmount && $amountToBridge > 0n}
        disabled={$focused}
        position="left"
        tooltip="Input is too low, must be at least {formatUnits($minAmount, asset.decimals)}" />
    </span>

    <button
      class="tooltip tooltip-left leading-8 py-2 px-3 flex flex-row space-x-2 items-center open-modal-container"
      data-tip={asset.name}
      on:click={openModal}>
      <AssetWithNetwork {asset} tokenSize={8} networkSize={4} />
      <span class="ml-2">{asset.symbol}</span>
      <Icon icon="mingcute:right-fill" height="1em" width="1em" class="flex icon transition-all" />
    </button>
  </div>
</div>

<style lang="postcss">
  :global(.open-modal-container:hover .icon) {
    @apply translate-x-1;
  }
</style>

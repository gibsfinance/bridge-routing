<script lang="ts">
  import NetworkSummary from './NetworkSummary.svelte'
  import { formatUnits } from 'viem'
  import type { VisualChain } from '$lib/stores/auth/types'
  import { get, writable, type Writable } from 'svelte/store'
  import { amountToBridge, fromTokenBalance } from '$lib/stores/bridge-settings'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import Warning from './Warning.svelte'
  import Icon from '@iconify/svelte'
  import * as modalStore from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import type { FormEventHandler } from 'svelte/elements'
  import { minAmount } from '$lib/stores/chain-events'
  import { stripNonNumber } from '$lib/stores/utils'
  import Hover from './Hover.svelte'
  import Tooltip from './Tooltip.svelte'
  import { hover } from '$lib/modifiers/hover'

  export let network!: VisualChain
  export let asset!: Token | null
  export let value!: Writable<string>
  // when asset changs, reset to zero
  $: if (asset) {
    value.set('')
  }
  let val = ''
  const focused = writable(false)
  const openModal = () => {
    modalStore.type.set('choosetoken')
  }
  const handleInput: FormEventHandler<HTMLInputElement> = (e) => {
    value.set(e.currentTarget.value)
  }
  const handleMaxBalance = () => {
    if (typeof $fromTokenBalance !== 'bigint') {
      return
    }
    const updated = formatUnits($fromTokenBalance, asset?.decimals || 18)
    value.set(updated)
  }
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg">
    <NetworkSummary {network} {asset} inChain balance={$fromTokenBalance} showMax on:max-balance={handleMaxBalance} />
  </div>
  <div class="flex flex-row mt-[1px] bg-slate-100 rounded-b-lg text-xl justify-between">
    <span class="flex flex-grow relative max-w-[70%]">
      <input
        class="bg-transparent leading-8 outline-none px-3 py-2 placeholder-current hover:appearance-none focus:shadow-inner flex-grow text-xl sm:text-2xl w-full"
        placeholder="0.0"
        value={$focused ? val : $value}
        on:focus={() => {
          val = stripNonNumber(get(value))
          focused.set(true)
        }}
        on:blur={() => focused.set(false)}
        on:input={handleInput} />
      <Warning
        show={$amountToBridge < $minAmount && $amountToBridge > 0n}
        disabled={$focused}
        position="left"
        tooltip="Input is too low, must be at least {formatUnits($minAmount, asset?.decimals || 18)}" />
    </span>

    <Hover let:handlers let:hovering>
      <button
        use:hover={handlers}
        class="leading-8 py-2 pr-3 pl-2 flex flex-row space-x-2 items-center open-modal-container relative"
        on:click={openModal}>
        {#if !!asset}
          <AssetWithNetwork {asset} tokenSize={8} networkSize={4} />
          <span class="ml-2">{asset?.symbol || ''}</span>
        {/if}
        <Icon icon="mingcute:right-fill" height="1em" width="1em" class="flex icon transition-all" />
        <Tooltip show={hovering}>{asset?.name || ''}</Tooltip>
      </button>
    </Hover>
  </div>
</div>

<style lang="postcss">
  :global(.open-modal-container:hover .icon) {
    @apply translate-x-1;
  }
</style>

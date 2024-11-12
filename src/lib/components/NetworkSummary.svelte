<script lang="ts">
  import { humanReadableNumber } from '$lib/stores/utils'
  import type { VisualChain } from '$lib/stores/auth/types'
  import NetworkImage from './NetworkImage.svelte'
  import { createEventDispatcher } from 'svelte'
  import * as utils from '$lib/utils'
  import type { Token } from '$lib/types'
  import Hover from './Hover.svelte'
  import { hover } from '$lib/modifiers/hover'
  import Tooltip from './Tooltip.svelte'
  import { loading } from '$lib/stores/loading'
  export let balance: bigint | null = null
  export let asset: Token | null = null
  export let network!: VisualChain
  export let showMax = false
  export let unwrap = false
  export let inChain = false
  $: disableMax = balance === 0n
  const dispatch = createEventDispatcher()
  const maxOutBalance = () => {
    if (disableMax) return
    dispatch('max-balance')
  }
</script>

<div class="flex flex-row justify-between">
  <div class="flex flex-row">
    <NetworkImage {network} {inChain} />
  </div>
  <div class="flex flex-row">
    <Hover let:handlers let:hovering>
      <div
        use:hover={handlers}
        class="text-xs leading-8 flex items-baseline self-end relative"
        class:mx-2={showMax}
        class:ml-2={!showMax}>
        {#if !!asset}
          <Tooltip show={hovering}>{utils.nativeName(asset, unwrap)}</Tooltip>
        {/if}
        <span
          class="max-w-[175px] overflow-hidden overflow-ellipsis"
          class:opacity-60={!$loading.isResolved('balance')}
          >{balance === null ? '' : humanReadableNumber(balance, asset?.decimals || 18)}</span
        >{utils.nativeSymbol(asset, unwrap)}
      </div>
    </Hover>
    {#if showMax}
      <div class="text-white leading-8">
        <button
          class="uppercase rounded-md text-xs leading-6 px-2"
          class:bg-purple-400={disableMax}
          class:bg-purple-600={!disableMax}
          class:hover:bg-purple-500={!disableMax}
          on:click={maxOutBalance}>
          max
        </button>
      </div>
    {/if}
  </div>
</div>

<script lang="ts">
  import { humanReadableNumber } from '$lib/stores/utils'
  import type { Chains, VisualChain } from '$lib/stores/auth/types'
  import NetworkImage from './NetworkImage.svelte'
  import { createEventDispatcher } from 'svelte'
  import * as utils from '$lib/utils'
  import Loading from './Loading.svelte'
  import type { Token } from '$lib/types'
  export let balance = 0n
  export let asset!: Token
  export let network!: VisualChain
  export let networkOptions: Chains[] = []
  export let showMax = false
  export let unwrap = false
  $: disableMax = balance === 0n
  const dispatch = createEventDispatcher()
  const maxOutBalance = () => {
    if (disableMax) return
    dispatch('max-balance')
  }
</script>

<div class="flex flex-row justify-between">
  <div class="flex flex-row">
    <NetworkImage {network} {networkOptions} />
  </div>
  <div class="flex flex-row">
    <div
      class="text-xs leading-8 tooltip tooltip-left flex items-end self-end"
      class:mx-2={showMax}
      class:ml-2={!showMax}
      data-tip={utils.nativeName(asset, unwrap)}>
      <Loading key={['balance', 'minAmount']}>{humanReadableNumber(balance, asset?.decimals || 18)}</Loading
      >&nbsp;{utils.nativeSymbol(asset, unwrap)}
    </div>
    {#if showMax}
      <div class="text-white leading-8">
        <button
          class="uppercase rounded-md text-xs leading-6 px-2"
          class:bg-purple-600={!disableMax}
          class:bg-purple-400={disableMax}
          on:click={maxOutBalance}>
          max
        </button>
      </div>
    {/if}
  </div>
</div>

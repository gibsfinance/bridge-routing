<script lang="ts">
  import type { Chains, VisualChain } from '$lib/stores/auth/types'
  import { formatEther } from 'viem'
  import NetworkImage from './NetworkImage.svelte'
  import { createEventDispatcher } from 'svelte'
  import type { Asset } from '$lib/stores/utils'
  import Loading from './Loading.svelte'
  export let balance = 0n
  export let asset!: Asset
  export let network!: VisualChain
  export let networkOptions: Chains[] = []
  export let showMax = false
  export let native = false
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
      data-tip={native ? asset.native?.name || asset.name : asset.name}>
      <Loading key={['balance', 'minAmount']}>{balance == 0n ? '0.0' : formatEther(balance)}</Loading>&nbsp;{native
        ? asset.native?.symbol || asset.symbol
        : asset.symbol}
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

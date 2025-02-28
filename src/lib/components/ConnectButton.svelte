<script lang="ts">
  import { accountState, connect } from '$lib/stores/auth/AuthProvider.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import Button from '$lib/components/Button.svelte'
  import Image from './Image.svelte'
  import Icon from '@iconify/svelte'
  import { Chains } from '$lib/stores/auth/types'
  import { ellipsis, humanReadableNumber } from '$lib/stores/utils'
  const targetChain = $derived(chainsMetadata[accountState.chainIdHex as Chains])
  const shortBalance = $derived(
    humanReadableNumber(accountState.balance ?? 0n, {
      decimals: targetChain.nativeCurrency.decimals,
      maxDecimals: 4,
    }),
  )
</script>

<Button
  class="btn preset-tonal pl-2 pr-0 py-0 gap-1.5 shadow-inner border border-surface-100/20"
  onclick={connect}>
  {#if accountState.connected}
    <Image src={targetChain.icon} alt={targetChain.name} class="size-4" />
    <span>
      <span>{shortBalance}</span>
      <span>{targetChain.nativeCurrency.symbol}</span>
    </span>
    <span class="border-surface-500/20 bg-surface-300/20 rounded-r px-2 leading-9">
      <span
        >{accountState.address &&
          ellipsis(accountState.address, { length: 5, prefixLength: 2 })}</span>
    </span>
  {:else if accountState.modalOpen}
    <Icon icon="icomoon-free:spinner9" class="animate-spin" />
    <span>Connecting...</span>
  {:else}
    <span>Connect</span>
    <Icon icon="mingcute:right-fill" height="1em" width="1em" />
  {/if}
</Button>

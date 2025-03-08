<script lang="ts">
  import { accountState, connect } from '$lib/stores/auth/AuthProvider.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import Button from '$lib/components/Button.svelte'
  import Image from './Image.svelte'
  import Icon from '@iconify/svelte'
  import { Chains } from '$lib/stores/auth/types'
  import {
    ellipsis,
    // humanReadableNumber,
  } from '$lib/stores/utils'
  const targetChain = $derived(chainsMetadata[accountState.chainIdHex as Chains])
  // const shortBalance = $derived(
  //   humanReadableNumber(accountState.balance ?? 0n, {
  //     decimals: targetChain.nativeCurrency.decimals,
  //     maxDecimals: 4,
  //   }),
  // )
</script>

<Button
  class="bg-surface-300/20 pr-2 py-0 shadow-inner border-2 border-surface-100/20 rounded-full h-10 text-surface-contrast-950 text-base flex flex-row items-center gap-1 bottom-2 right-2"
  onclick={connect}>
  {#if accountState.connected}
    <Image
      src={targetChain.icon}
      alt={targetChain.name}
      containerClasses="flex overflow-hidden rounded-l-full"
      sizeClasses="size-9" />
    <span class="border-surface-500/20 rounded-r pl-1 leading-8">
      <span
        >{accountState.address &&
          ellipsis(accountState.address, {
            length: 6,
            prefixLength: 2,
          })}</span>
    </span>
  {:else if accountState.modalOpen}
    <span class="pl-2">Connecting...</span>
    <Icon icon="icomoon-free:spinner9" class="animate-spin" />
  {:else}
    <span class="pl-2">Connect</span>
    <Icon icon="mingcute:right-fill" height="1em" width="1em" />
  {/if}
</Button>

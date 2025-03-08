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
  class="bg-surface-300/20 pl-0 pr-0 py-0 shadow-inner border-2 border-surface-100/20 rounded-full h-10 text-surface-contrast-950 text-base flex flex-row items-center gap-1 bottom-2 right-2"
  onclick={connect}>
  {#if accountState.connected}
    <span class="border-surface-500/20 rounded-r pl-2 leading-8">
      <span
        >{accountState.address &&
          ellipsis(accountState.address, {
            length: 6,
            prefixLength: 2,
          })}</span>
    </span>
    <Image
      src={targetChain.icon}
      alt={targetChain.name}
      containerClasses="flex overflow-hidden rounded-l-full"
      sizeClasses="size-9" />
  {:else if accountState.modalOpen}
    <Icon icon="icomoon-free:spinner9" class="animate-spin" />
    <span class="pr-2">Connecting...</span>
  {:else}
    <span>Connect</span>
    <Icon icon="mingcute:right-fill" height="1em" width="1em" class="mr-2" />
  {/if}
</Button>

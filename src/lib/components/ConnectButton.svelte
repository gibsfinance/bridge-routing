<script lang="ts">
  import { accountState, appkitNetworkById, connect } from '$lib/stores/auth/AuthProvider.svelte'
  import Button from '$lib/components/Button.svelte'
  import Image from './Image.svelte'
  import Icon from '@iconify/svelte'
  import { idToChain } from '$lib/stores/auth/types'
  import { availableChains, availableChainsByName, loadData } from '$lib/stores/lifi.svelte'
  import * as imageLinks from '$lib/stores/image-links'
  loadData()
  const targetChain = $derived.by(() => {
    const id = accountState.chainId
    if (!id) return null
    console.log(accountState.prefix)
    const chainId = Number(id)
    const chain = availableChains.get(chainId)
    if (chain) {
      return {
        name: chain.name,
        logoURI: chain.logoURI,
      }
    }
    const networkByPrefix = availableChainsByName.get(accountState.prefix!)
    if (networkByPrefix) {
      return {
        name: networkByPrefix.name,
        logoURI: networkByPrefix.logoURI,
      }
    }
    const appkitNetwork = appkitNetworkById.get(id!)
    if (appkitNetwork) {
      return {
        name: appkitNetwork.name,
        logoURI: appkitNetwork.assets?.imageUrl,
      }
    }
    const network = idToChain.get(chainId)
    if (network) {
      return {
        name: network.name,
        logoURI: network.logoURI || imageLinks.network(chainId),
      }
    }
    return null
  })
</script>

<Button
  class="bg-surface-white/20 p-1 shadow-inner border border-surface-200 rounded-full h-10 text-surface-contrast-50 text-base flex flex-row items-center gap-1 bottom-2 right-2"
  onclick={connect}>
  {#if accountState.connected}
    {#if targetChain}
      <Image
        src={targetChain.logoURI}
        alt={targetChain.name}
        containerClasses="flex overflow-hidden rounded-l-full"
        sizeClasses="size-8" />
    {/if}
    <span class="border-surface-500/20 rounded-r pl-1 leading-8 mr-2 text-sm">
      <span>{accountState.address && accountState.address.slice(0, 8)}...</span>
    </span>
  {:else if accountState.modalOpen}
    <span class="pl-2">Connecting...</span>
    <Icon icon="icomoon-free:spinner9" class="animate-spin" />
  {:else}
    <span class="pl-2">Connect</span>
    <Icon icon="mingcute:right-fill" height="1em" width="1em" />
  {/if}
</Button>

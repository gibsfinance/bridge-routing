<script lang="ts">
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import type { Token } from '$lib/types.svelte'
  import Icon from '@iconify/svelte'

  type Props = {
    token: Token
    network?: number
    hideChevron?: boolean
  }
  const { token, network, hideChevron = false }: Props = $props()
</script>

<div
  class="flex flex-row items-center justify-center h-full p-0.5 rounded-full"
  class:border-2={!hideChevron}>
  <AssetWithNetwork asset={token} {network} />
  <span class="text-surface-contrast-50 leading-8 text-xl pl-2">{token.symbol}</span>
  {#if !hideChevron}
    <Icon icon="mdi:chevron-down" class="text-surface-500 h-6 w-6 justify-self-start" />
  {/if}
</div>

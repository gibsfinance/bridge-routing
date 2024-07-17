<script lang="ts">
  import { type VisualChain } from '$lib/stores/auth/types'
  import ProviderIcon from './ProviderIcon.svelte'

  export let network!: VisualChain
  export let height = 32
  export let provider: string | null = null
</script>

<div class="relative">
  <img class="network-icon min-w-8" style:height={`${height}px`} src={network.icon} alt={network.alt} />
  {#if provider}
    <div class="absolute -bottom-1 -left-1 rounded-full">
      <ProviderIcon {provider} size="16" />
    </div>
  {/if}
</div>

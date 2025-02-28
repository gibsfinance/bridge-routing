<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import type { Chains } from '$lib/stores/auth/types'
  import { domains, addDomain } from '$lib/stores/window.svelte'
  import Icon from '@iconify/svelte'

  type Props = {
    size?: string
    path: string
    chain: Chains
  }
  const { size = '1.5em', path, chain }: Props = $props()
  const explorer = $derived(chainsMetadata[chain]?.blockExplorers?.default?.url || '')
  const d = $derived(domains.get(explorer) || '')
  $effect(() => {
    if (explorer) addDomain(explorer)
  })
</script>

<a
  href="{d || explorer}{d ? '#' : ''}{path}"
  aria-label="direct{d ? ' to ipfs' : ''} page for {explorer}"
  target="_blank">
  <Icon icon="gis:direct" class="inline mx-1" height={size} width={size} />
</a>

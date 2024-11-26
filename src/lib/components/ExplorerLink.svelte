<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import type { Chains } from '$lib/stores/auth/types'
  import { directDomain, domains } from '$lib/stores/window'
  import Icon from '@iconify/svelte'

  export let path = ''
  export let chainId: Chains
  $: explorer = chainsMetadata[chainId].blockExplorers?.default?.url || ''
  $: if (explorer) domains.add(explorer)
  $: d = $directDomain.get(explorer) || ''
</script>

<slot direct={d} {path}>
  <a
    href="{d || explorer}{d ? '#' : ''}{path}"
    aria-label="direct{d ? ' to ipfs' : ''} page for {explorer}"
    target="_blank">
    <Icon icon="gis:direct" class="inline mx-1" height="2em" width="2em" />
  </a>
</slot>

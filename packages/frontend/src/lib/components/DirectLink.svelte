<script lang="ts">
  import { evmChainsById } from '../stores/auth/AuthProvider.svelte'
  import { chainsMetadata } from '../stores/auth/constants'
  import { toChain } from '../stores/auth/types'
  import { domains, addDomain } from '../stores/window.svelte'
  import type { ClassValue } from 'svelte/elements'
  import Icon from '@iconify/svelte'

  type Props = {
    size?: string
    path: string
    chain: number
    class?: ClassValue
    linkClasses?: ClassValue
  }
  const { class: className = '', path, chain: chainId, linkClasses = '' }: Props = $props()
  const chain = $derived(chainsMetadata[toChain(chainId)] ?? evmChainsById.get(chainId))
  const explorer = $derived(chain?.blockExplorers?.default?.url || '')
  const d = $derived(domains.get(explorer) || '')
  $effect(() => {
    if (explorer) addDomain(explorer)
  })
  const classes = $derived(['inline mx-1', className])
  const linkClassNames = $derived(['flex', linkClasses])
  const href = $derived(`${d || explorer}${d ? '#' : ''}${path}`)
</script>

<a
  {href}
  aria-label="direct{d ? ' to ipfs' : ''} page for {explorer}"
  target="_blank"
  class={linkClassNames}>
  <Icon icon="gis:direct" class={classes} />
</a>

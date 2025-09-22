<script lang="ts">
  import Icon from '@iconify/svelte'
  import type { ClassValue } from 'svelte/elements'
  import { toChain } from '@gibs/bridge-sdk/config'
  import { chainsMetadata } from '@gibs/bridge-sdk/chains'

  import { evmChainsById } from '../stores/auth/AuthProvider.svelte'
  import { domains, addDomain } from '../stores/window.svelte'

  type Props = {
    path: string
    chain: number
    size?: number
    class?: ClassValue
  }
  const { class: className = '', path, chain: chainId, size = 5 }: Props = $props()
  const chain = $derived(chainsMetadata[toChain(chainId)] ?? evmChainsById.get(chainId))
  const explorer = $derived(chain?.blockExplorers?.default?.url || '')
  const d = $derived(domains.get(explorer) || '')
  $effect(() => {
    if (explorer) addDomain(explorer)
  })
  const classes = $derived(['flex items-center', className])
  const linkClassNames = $derived(['flex', className, `w-${size} h-${size}`])
  const href = $derived(`${d || explorer}${d ? '#' : ''}${path}`)
</script>

<a
  {href}
  aria-label="direct{d ? ' to ipfs' : ''} page for {explorer}"
  target="_blank"
  class={linkClassNames}>
  <Icon icon="gis:direct" class={classes} height={size * 4} width={size * 4} />
</a>

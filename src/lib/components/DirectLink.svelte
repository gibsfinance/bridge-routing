<script lang="ts">
  import { evmChainsById } from '$lib/stores/auth/AuthProvider.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { toChain } from '$lib/stores/auth/types'
  import { domains, addDomain } from '$lib/stores/window.svelte'
  import type { ClassParam } from '$lib/types.svelte'
  import Icon from '@iconify/svelte'
  import classNames from 'classnames'

  type Props = {
    size?: string
    path: string
    chain: number
    class?: ClassParam
    linkClasses?: ClassParam
  }
  const { class: className = '', path, chain: chainId, linkClasses = '' }: Props = $props()
  const chain = $derived(chainsMetadata[toChain(chainId)] ?? evmChainsById.get(chainId))
  const explorer = $derived(chain?.blockExplorers?.default?.url || '')
  const d = $derived(domains.get(explorer) || '')
  $effect(() => {
    if (explorer) addDomain(explorer)
  })
  const classes = $derived(classNames('inline mx-1', className))
  const linkClassNames = $derived(classNames(linkClasses))
</script>

<a
  href="{d || explorer}{d ? '#' : ''}{path}"
  aria-label="direct{d ? ' to ipfs' : ''} page for {explorer}"
  target="_blank"
  class={linkClassNames}>
  <Icon icon="gis:direct" class={classes} />
</a>

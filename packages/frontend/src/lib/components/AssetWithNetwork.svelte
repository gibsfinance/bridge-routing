<script lang="ts">
  import type { Token } from '../types.svelte'
  import type { ClassValue } from 'svelte/elements'
  import TokenIcon from './TokenIcon.svelte'
  import { assetSources } from '../stores/bridge-settings.svelte'
  import { loading } from '../stores/loading.svelte'
  import Image from './Image.svelte'
  import { chainsMetadata } from '../stores/auth/constants'
  import { toChain } from '../stores/auth/types'
  import { zeroAddress } from 'viem'
  import { bridgableTokens } from '../stores/input.svelte'

  type Props = {
    class?: ClassValue
    asset: Token | null
    network?: number
    tokenSizeClasses?: ClassValue
    networkSizeClasses?: ClassValue
  }
  const {
    asset,
    tokenSizeClasses = 'size-8',
    networkSizeClasses = 'size-4',
    class: className = '',
  }: Props = $props()
  const chainId = $derived(asset?.chainId ? Number(asset.chainId) : 0)
  const chain = $derived(chainsMetadata[toChain(chainId)])
  const src = $derived(asset?.logoURI || assetSources(asset, [], bridgableTokens.value))
  const tokenClasses = $derived(`overflow-hidden absolute`)
  const classes = $derived([
    'flex basis-auto relative text-surface-contrast-50',
    tokenSizeClasses,
    className,
  ])
  const finishedLoading = $derived(chain && loading.isResolved('token'))
  const nativeToken = $derived(zeroAddress === asset?.address)
</script>

<span class={classes} title={asset?.symbol ?? ''}>
  {#if src}
    <TokenIcon visible sizeClasses={tokenSizeClasses} class={tokenClasses} {src} />
    {#if finishedLoading && !nativeToken}
      <Image
        class="network-image absolute -left-0.5 -bottom-0.5 rounded-full bg-surface-50"
        sizeClasses={networkSizeClasses}
        src={chain.logoURI}
        alt={chain.name} />
    {/if}
  {/if}
</span>

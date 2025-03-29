<script lang="ts">
  import type { ClassParam, Token } from '$lib/types.svelte'
  import TokenIcon from './TokenIcon.svelte'
  import { assetSources } from '$lib/stores/bridge-settings.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import Image from './Image.svelte'
  import classNames from 'classnames'
  import { availableChains } from '$lib/stores/lifi.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { toChain, type VisualChain } from '$lib/stores/auth/types'
  import type { ExtendedChain } from '@lifi/sdk'

  type Props = {
    class?: ClassParam
    asset: Token | null
    network?: number
    tokenSizeClasses?: string
    networkSizeClasses?: string
  }
  const {
    asset,
    tokenSizeClasses = 'size-8',
    networkSizeClasses = 'size-4',
    class: className = '',
  }: Props = $props()
  const chainId = $derived(asset?.chainId ? Number(asset.chainId) : 0)
  const chain = $derived(availableChains.get(chainId) ?? chainsMetadata[toChain(chainId)])
  const src = $derived(asset?.logoURI || assetSources(asset))
  const tokenClasses = $derived(`overflow-hidden absolute`)
  const classes = $derived(
    classNames('flex basis-auto relative text-surface-contrast-50', tokenSizeClasses, className),
  )
  const finishedLoading = $derived(chain && loading.isResolved('token'))
  const nativeTokenOnChain = $derived(
    (chain as ExtendedChain)?.nativeToken ?? (chain as VisualChain)?.nativeCurrency,
  )
  const nativeToken = $derived(nativeTokenOnChain.address === asset?.address)
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

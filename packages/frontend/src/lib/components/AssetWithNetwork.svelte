<script lang="ts">
  import type { Token } from '@gibs/bridge-sdk/types'
  import { chainsMetadata } from '@gibs/bridge-sdk/chains'
  import { Chains, deprecatedNativeAssetOut, toChain } from '@gibs/bridge-sdk/config'
  import type { ClassValue } from 'svelte/elements'
  import { getAddress, zeroAddress } from 'viem'

  import { assetSources } from '../stores/bridge-settings.svelte'
  import { loading } from '../stores/loading.svelte'
  import { bridgableTokens } from '../stores/input.svelte'

  import Image from './Image.svelte'
  import TokenIcon from './TokenIcon.svelte'

  type Props = {
    class?: ClassValue
    asset: Token | null
    network?: number
    tokenSizeClasses?: ClassValue
    networkSizeClasses?: ClassValue
    hideNetwork?: boolean
  }
  const {
    asset,
    tokenSizeClasses = 'size-8',
    networkSizeClasses = 'size-4',
    class: className = '',
    hideNetwork = false,
  }: Props = $props()
  const chainId = $derived(asset?.chainId ? Number(asset.chainId) : 0)
  const chain = $derived(chainsMetadata[toChain(chainId)])
  const src = $derived(asset?.logoURI || assetSources(asset, bridgableTokens.value))
  const tokenClasses = $derived(`overflow-hidden absolute`)
  const classes = $derived([
    'flex basis-auto relative text-surface-contrast-50',
    tokenSizeClasses,
    className,
  ])
  const finishedLoading = $derived(chain && loading.isResolved('token'))
  const nativeToken = $derived(zeroAddress === asset?.address)
  const showWarning = $derived(asset?.chainId === Number(Chains.ETH) && deprecatedNativeAssetOut[Chains.PLS]!.has(getAddress(asset?.address)))
</script>

<span class={classes} title={asset?.symbol ?? ''}>
  {#if src}
    <TokenIcon visible sizeClasses={tokenSizeClasses} class={tokenClasses} {showWarning} {src} />
    {#if finishedLoading && !nativeToken && !hideNetwork}
      <Image
        class="network-image absolute -left-0.5 -bottom-0.5 rounded-full bg-surface-50"
        sizeClasses={networkSizeClasses}
        src={chain.logoURI}
        alt={chain.name} />
    {/if}
  {/if}
</span>

<script lang="ts">
  import { getAddress, isAddress, type Hex, zeroAddress } from 'viem'
  import { onMount } from 'svelte'
  import { pathway } from '@gibs/bridge-sdk/config'
  import { Chains, type Provider, type ChainKey } from '@gibs/bridge-sdk/config'
  import type { BridgeKey } from '@gibs/bridge-sdk/types'

  import BlurryImage from '../components/BlurryImage.svelte'
  import Bridge from '../components/Bridge.svelte'
  import Headline from '../components/Headline.svelte'
  import { windowStore } from '../stores/window.svelte'
  import * as input from '../stores/input.svelte'
  import { page } from '../stores/app-page.svelte'
  import * as nav from '../stores/nav.svelte'
  import Loading from '../components/Loading.svelte'
  import { isProd } from '../stores/config.svelte'
  const bridgeImageFuzzyWebP = 'images/bridge-fuzzy.webp'
  const provider = $derived(page.params.provider as Provider)
  const fromChain = $derived(page.params.fromChain as ChainKey)
  const toChain = $derived(page.params.toChain as ChainKey)
  const bridgeKey = $derived([provider, Chains[fromChain], Chains[toChain]] as BridgeKey)

  onMount(() => {
    if (!pathway(bridgeKey, isProd.value)) {
      const assetInAddress = page.params.assetInAddress ?? zeroAddress
      nav.bridge.shallow(input.defaultBridgeKey, assetInAddress)
    } else {
      input.bridgeKey.value = bridgeKey
      let assetInAddress = page.params.assetInAddress as Hex | null
      if (assetInAddress && isAddress(assetInAddress)) {
        assetInAddress = getAddress(assetInAddress)
      } else {
        assetInAddress = null
      }
      input.bridgeKey.assetInAddress = assetInAddress
    }
  })
</script>

<div class="flex w-full bg-slate-950">
  {#if page.to}
    <Loading />
  {:else}
    <div class="flex flex-col w-full">
      <div class="flex w-full">
        <BlurryImage
          min_height={page.embed ? '100vh' : windowStore.large ? 'calc(100vh - 56px)' : 'auto'}
          image_url="url({bridgeImageFuzzyWebP})">
          <div class="max-w-lg flex flex-col text-lg w-full" class:my-4={page.embed} class:my-16={!page.embed} class:justify-center={page.embed}>
            {#if !page.embed || page.mode !== 'simple'}
              <Headline>Bridge</Headline>
            {/if}
            <Bridge />
          </div>
        </BlurryImage>
      </div>
    </div>
  {/if}
</div>

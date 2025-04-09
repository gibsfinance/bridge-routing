<script lang="ts">
  import BlurryImage from '../components/BlurryImage.svelte'
  import Bridge from '../components/Bridge.svelte'
  import Headline from '../components/Headline.svelte'
  import { windowStore } from '../stores/window.svelte'
  import * as input from '../stores/input.svelte'
  import { navigating, page, goto } from '../stores/page.svelte'
  import { pathway } from '../stores/config.svelte'
  import Loading from '../components/Loading.svelte'
  import { Chains, type Provider, type ChainKey } from '../stores/auth/types'
  import { getAddress, isAddress, type Hex, zeroAddress } from 'viem'
  const provider = page.params.provider as Provider
  const fromChain = page.params.fromChain as ChainKey
  const toChain = page.params.toChain as ChainKey
  const bridgeKey = [provider, Chains[fromChain], Chains[toChain]] as input.BridgeKey

  if (!pathway(bridgeKey)) {
    const bridgeKeyPath = input.toPath(input.defaultBridgeKey)
    const assetInAddress = page.params.assetInAddress ?? zeroAddress
    goto(`#/delivery/${bridgeKeyPath}/${assetInAddress}`)
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

  // const bridgeImageFuzzyWebP = new URL('/images/bridge-fuzzy.webp', import.meta.url).href
  const bridgeImageFuzzyWebP = 'images/bridge-fuzzy.webp'
</script>

<div class="flex w-full bg-slate-950">
  {#if navigating.to}
    <Loading />
  {:else}
    <div class="flex flex-col w-full">
      <div class="flex w-full">
        <BlurryImage
          min_height={windowStore.large ? 'calc(100vh - 56px)' : 'auto'}
          image_url="url({bridgeImageFuzzyWebP})"
          blur="9px"
          brightness="100%">
          <div class="max-w-lg flex flex-col text-lg w-full my-16">
            <Headline>Delivery</Headline>
            <Bridge />
          </div>
        </BlurryImage>
      </div>
    </div>
  {/if}
</div>

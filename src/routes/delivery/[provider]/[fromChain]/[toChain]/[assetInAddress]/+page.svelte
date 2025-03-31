<script lang="ts">
  import BlurryImage from '$lib/components/BlurryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import Headline from '$lib/components/Headline.svelte'
  import { windowStore } from '$lib/stores/window.svelte'
  const bridgeImageFuzzyWebP = new URL('/images/bridge-fuzzy.webp', import.meta.url).href
</script>

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
  <!-- <div class="flex flex-col w-full bg-slate-100 p-4 min-h-96">
    <h2 class="h2 text-center text-5xl font-italiana text-slate-950 font-bold my-4"
      >Bridge History</h2>
    <BridgeHistory />
  </div> -->
</div>

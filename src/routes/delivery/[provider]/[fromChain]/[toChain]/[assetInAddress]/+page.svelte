<script lang="ts">
  import BlurryImage from '$lib/components/BlurryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import bridgeImageFuzzyWebP from '$lib/images/bridge-fuzzy.webp'
  import BridgeFooter from '$lib/components/BridgeFooter.svelte'
  import { windowStore } from '$lib/stores/window'
  import BridgeHistory from '$lib/components/BridgeHistory.svelte'

  $: large = $windowStore.innerHeight > 600 && $windowStore.innerWidth >= 768
</script>

<div class="flex flex-col w-full">
  <div class="flex w-full">
    <BlurryImage
      min_height="calc(100vh - 104px)"
      image_url="url({bridgeImageFuzzyWebP})"
      blur="9px"
      brightness="50%">
      <div class="max-w-lg flex flex-col text-lg -mx-8 w-[512px]" class:w-full={large}>
        <h1
          class="text-white font-italiana z-10 top-0 bottom-0 left-0 right-0 text-center content-center capitalize text-5xl mt-8">
          token delivery
        </h1>
        <Bridge />
        <BridgeFooter />
      </div>
    </BlurryImage>
  </div>
  <div class="flex flex-col w-full bg-slate-100 p-4 min-h-96">
    <h2 class="h2 text-center text-5xl font-italiana text-slate-950 font-bold my-4"
      >Bridge History</h2>
    <BridgeHistory />
  </div>
</div>

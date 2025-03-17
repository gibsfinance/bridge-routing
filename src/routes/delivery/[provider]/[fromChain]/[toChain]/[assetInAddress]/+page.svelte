<script lang="ts">
  import BlurryImage from '$lib/components/BlurryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import { windowStore } from '$lib/stores/window.svelte'
  const bridgeImageFuzzyWebP = new URL('/images/bridge-fuzzy.webp', import.meta.url).href
</script>

<div class="flex flex-col w-full">
  <div class="flex w-full">
    <BlurryImage
      min_height={windowStore.large ? 'calc(100vh - 40px)' : 'auto'}
      image_url="url({bridgeImageFuzzyWebP})"
      blur="9px"
      brightness="100%">
      <div class="max-w-lg flex flex-col text-lg w-full mt-16">
        <!-- <h1
          class="text-white font-italiana z-10 top-0 bottom-0 left-0 right-0 text-center content-center capitalize text-5xl mt-16">
          delivery
        </h1> -->
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

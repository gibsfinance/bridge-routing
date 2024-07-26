<script lang="ts">
  import BlurryImage from '$lib/components/BlurryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import bridgeImageFuzzy from '$lib/images/bridge-fuzzy.jpeg'
  import BridgeFooter from '$lib/components/BridgeFooter.svelte'
  import { windowStore } from '$lib/stores/window'
  $: large = $windowStore.innerHeight > 600 && $windowStore.innerWidth >= 768
</script>

<BlurryImage min_height="100vh" image_url="url({bridgeImageFuzzy})" blur="9px" brightness="50%">
  <div class="m-auto max-w-lg flex flex-col text-lg -mx-8" class:container={large}>
    <h1
      class="text-white font-italiana z-10 top-0 bottom-0 left-0 right-0 m-auto text-center content-center capitalize text-4xl">
      token delivery
    </h1>
    <Bridge />
    <BridgeFooter />
  </div>
</BlurryImage>

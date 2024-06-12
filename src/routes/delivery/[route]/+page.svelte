<script lang="ts">
  import BlurryImage from '$lib/components/BlurryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import bridgeImage from '$lib/images/bridge.jpeg'
  import TokenDirectionDropdown from '$lib/components/TokenDirectionDropdown.svelte'
  import BridgeFooter from '$lib/components/BridgeFooter.svelte'
  import { windowStore } from '$lib/stores/window'
  $: large = $windowStore.innerHeight > 600 && $windowStore.innerWidth >= 768
</script>

<BlurryImage height="{large ? 300 : 100}px" image_url={bridgeImage}>
  <h1
    class="text-white font-italiana z-10 absolute top-0 bottom-0 left-0 right-0 m-auto text-center content-center capitalize"
    class:text-5xl={!large}
    class:md:text-8xl={large}>
    token delivery
  </h1>
</BlurryImage>

<div class="container m-auto max-w-lg flex flex-col">
  <!-- <TokenDirectionDropdown /> -->
  <Bridge />
  <BridgeFooter />
</div>

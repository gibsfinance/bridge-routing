<script lang="ts">
  import BlurryImage from '$lib/components/BlurryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import bridgeImage from '$lib/images/bridge.jpeg'
  import TokenDirectionDropdown from '$lib/components/TokenDirectionDropdown.svelte'
  import BridgeFooter from '$lib/components/BridgeFooter.svelte'
</script>

<BlurryImage height="300px" image_url={bridgeImage}>
  <h1
    class="text-white font-italiana z-10 absolute top-0 bottom-0 left-0 right-0 m-auto text-center text-6xl md:text-8xl content-center capitalize">
    token delivery
  </h1>
</BlurryImage>

<div class="container m-auto max-w-lg flex flex-col">
  <TokenDirectionDropdown />
  <Bridge />
  <BridgeFooter />
</div>

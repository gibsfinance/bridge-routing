<script lang="ts">
  import BluryImage from '$lib/components/BluryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import Info from '$lib/components/Info.svelte'
  import bridgeImage from '$lib/images/bridge.jpeg'
  import TokenDirectionDropdown from '$lib/components/TokenDirectionDropdown.svelte'
</script>

<BluryImage height="300px" image_url={bridgeImage}>
  <h1
    class="text-white font-italiana z-10 absolute top-0 bottom-0 left-0 right-0 m-auto text-center leading-10 text-8xl content-center">
    Bridge
  </h1>
</BluryImage>

<div class="container m-auto max-w-lg flex flex-col">
  <TokenDirectionDropdown />
  <Bridge />
  <Info />
</div>

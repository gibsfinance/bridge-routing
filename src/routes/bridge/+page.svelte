<script>
  import BluryImage from '$lib/components/BluryImage.svelte'
  import TokenDirection from '$lib/components/TokenDirection.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import Info from '$lib/components/Info.svelte'
  import bridgeImage from '$lib/images/bridge.jpeg'
  import { assetIn, assetOut } from '$lib/stores/bridge-settings'
</script>

<BluryImage max_height="300px" image_url={bridgeImage}>
  <h1
    class="text-white font-italiana z-10 absolute top-0 bottom-0 left-0 right-0 m-auto text-center leading-10 text-8xl content-center">
    Bridge
  </h1>
</BluryImage>

<div class="container m-auto max-w-lg">
  <TokenDirection fromAsset={$assetIn} toAsset={$assetOut} />
  <Bridge />
  <Info />
</div>

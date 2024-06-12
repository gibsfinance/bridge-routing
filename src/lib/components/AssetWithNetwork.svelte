<script lang="ts">
  import type { Asset } from '$lib/stores/utils'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { imageRoot } from '$lib/config'

  export let asset!: Asset
  export let tokenSize = 10
  export let networkSize = 5

  $: chain = chainsMetadata[asset.hostedNetwork]
  $: remap = new Map<string, string>([
    ['0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C', '1/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    ['0x518076CCE3729eF1a3877EA3647a26e278e764FE', '56/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'],
    // [
    //   '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
    //   `7fc959085dc2b96734a6e51c82086cb6b65aa5fe4492fe974f4b0ab7ba02d480/1/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2.raster`,
    // ],
    // [
    //   '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //   `7fc959085dc2b96734a6e51c82086cb6b65aa5fe4492fe974f4b0ab7ba02d480/1/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2.raster`,
    // ],
  ])

  $: remapped = remap.get(asset.address) || `${chain.id}/${asset.address}`
  $: console.log(asset.address, remapped)
</script>

<span class="token-image-container relative" style="--token-size: {tokenSize};">
  <img
    src="{imageRoot}/image/fallback/7fc959085dc2b96734a6e51c82086cb6b65aa5fe4492fe974f4b0ab7ba02d480/{remapped}"
    alt=""
    class="rounded-full overflow-hidden shadow-md" />
  <img
    class="network-image absolute -bottom-1 -right-1 bg-slate-100 rounded-full"
    style="--network-size: {networkSize};"
    src={chain.icon}
    alt={chain.alt} />
</span>

<style lang="postcss">
  .token-image-container {
    height: calc(var(--token-size) * 4px);
    width: calc(var(--token-size) * 4px);
    .network-image {
      height: calc(var(--network-size) * 4px);
      width: calc(var(--network-size) * 4px);
    }
  }
</style>

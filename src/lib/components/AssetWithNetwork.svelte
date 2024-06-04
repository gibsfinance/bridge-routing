<script lang="ts">
  import type { Asset } from '$lib/stores/utils'
  import bnbToken from '$lib/images/tokens/bnb.svg'
  import etherToken from '$lib/images/tokens/eth.svg'
  import { chainsMetadata } from '$lib/stores/auth/constants'

  export let asset!: Asset
  export let tokenSize = 10
  export let networkSize = 5

  const tokenMapping = new Map<string, string>([
    ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', etherToken],
    ['0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C', etherToken],
    ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', bnbToken],
    ['0x518076CCE3729eF1a3877EA3647a26e278e764FE', bnbToken],
  ])
  $: url = tokenMapping.get(asset.address as string) || `lib/tokens/${asset.address}.png`
</script>

<span class="token-image-container relative" style="--token-size: {tokenSize};">
  <img src={url} alt="" class="rounded-full overflow-hidden shadow-md" />
  <img
    class="network-image absolute -bottom-1 -right-1 bg-slate-100 rounded-full"
    style="--network-size: {networkSize};"
    src={chainsMetadata[asset.hostedNetwork].icon}
    alt={chainsMetadata[asset.hostedNetwork].alt} />
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

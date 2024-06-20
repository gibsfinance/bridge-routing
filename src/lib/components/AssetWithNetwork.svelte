<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { imageRoot } from '$lib/config'
  import type { Token } from '$lib/types'
  import { Chains } from '$lib/stores/auth/types'
  import TokenIcon from './TokenIcon.svelte'

  export let asset!: Token
  export let tokenSize = 10
  export let networkSize = 5

  let chain = chainsMetadata[Chains.PLS]
  $: remap = new Map<string, string>([
    ['0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C', '1/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    ['0x518076CCE3729eF1a3877EA3647a26e278e764FE', '56/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'],
  ])

  $: remapped = remap.get(asset.address) || `${chain.id}/${asset.address}`
</script>

<span class="token-image-container relative" style="--token-size: {tokenSize};">
  <TokenIcon
    visible
    size={tokenSize * 4}
    src="{imageRoot}/image/fallback/7fc959085dc2b96734a6e51c82086cb6b65aa5fe4492fe974f4b0ab7ba02d480/{remapped}"
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

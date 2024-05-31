<script lang="ts">
  import type { Asset } from '$lib/stores/utils'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import BridgerIcon from './BridgerIcon.svelte'
  import bridgeUrl from '$lib/images/bridge.svg'
  import { assets, bridgeKey } from '$lib/stores/bridge-settings'

  export let fromAsset!: Asset
  export let toAsset!: Asset
  export let provider!: string
</script>

<div class="flex flex-row justify-center justify-items-center leading-10 px-2">
  <AssetWithNetwork asset={fromAsset} />
  <img height="42" width="42" src={bridgeUrl} alt="a suspension bridge" class="opacity-80" />
  <span
    class="leading-10 justify-items-center flex flex-col-reverse content-stretch justify-around">
    <BridgerIcon {provider} />
  </span>
  <img height="42" width="42" src={bridgeUrl} alt="a suspension bridge" class="opacity-80" />
  <AssetWithNetwork asset={toAsset} />
</div>

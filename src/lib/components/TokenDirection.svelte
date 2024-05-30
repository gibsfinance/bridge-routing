<script lang="ts">
  import type { Asset } from '$lib/stores/utils'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import Icon from '@iconify/svelte'

  export let fromAsset!: Asset
  export let toAsset!: Asset
</script>

<div class="flex flex-row justify-center justify-items-center mt-8 leading-10">
  <AssetWithNetwork asset={fromAsset} />
  <span
    class="mx-2 leading-10 justify-items-center flex flex-col-reverse content-stretch justify-around">
    <Icon icon="mingcute:right-fill" height="1.25em" width="1.25em" />
  </span>
  <AssetWithNetwork asset={toAsset} />
</div>

<script lang="ts">
  import { Chains } from '$lib/stores/auth/types'
  import type { Asset } from '$lib/stores/utils'
  import { zeroAddress } from 'viem'
  import ethNetworkUrl from '$lib/images/networks/0x1.svg'

  export let asset!: Asset

  const tokenMapping = new Map<string, string>([
    [zeroAddress, 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'],
    [
      '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
      'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    ],
  ])
  const networkMapping = new Map<Chains, string>([
    [
      Chains.PLS,
      'https://pulsex-tokens.s3.eu-west-2.amazonaws.com/0xA1077a294dDE1B09bB078844df40758a5D0f9a27.png',
    ],
    [Chains.ETH, ethNetworkUrl],
  ])
  $: url = tokenMapping.get(asset.address as string) || `lib/tokens/${asset.address}.png`
  $: networkUrl = networkMapping.get(asset.hostedNetwork)
</script>

<!-- <a href=""> -->
<button class="rounded-full h-10 w-10 bg-slate-200 shadow-inner relative">
  <img src={url} alt="" />
  <img
    class="absolute -bottom-1 -right-1 h-5 w-5 bg-slate-100 rounded-full"
    src={networkUrl}
    alt="" />
</button>
<!-- </a> -->

<script lang="ts">
  import FromNetwork from './FromNetwork.svelte'
  import ToNetwork from './ToNetwork.svelte'
  import Version from './Version.svelte'
  import ConnectAndBridge from './ConnectAndBridge.svelte'
  import NetworkDirection from './NetworkDirection.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { zeroAddress } from 'viem'
  import Settings from './Settings.svelte'
  import Details from './Details.svelte'
  import type { Asset } from '$lib/stores/utils'
  import { assetOut } from '$lib/stores/bridge-settings'
  let originationChain = chainsMetadata[Chains.PLS]
  let destinationChain = chainsMetadata[Chains.ETH]
  let amountInBridge = 0n
  let dropdowns: Record<string, boolean> = {}
  const toggleDropdowns = (e: CustomEvent) => {
    for (const k of Object.keys(dropdowns)) {
      if (k !== e.detail) {
        dropdowns[k] = false
      }
    }
    dropdowns[e.detail] = !dropdowns[e.detail]
  }
</script>

<div class="bg-slate-200 p-4 rounded-lg shadow-inner text-slate-950 my-8">
  <FromNetwork
    network={originationChain}
    asset={{
      symbol: 'WETH',
      name: 'Wrapped Ether from Ethereum',
      address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
      decimals: 18,
      networkOrigination: Chains.ETH,
    }}
  />
  <NetworkDirection />
  <ToNetwork
    originationNetwork={originationChain}
    network={destinationChain}
    on:toggle={toggleDropdowns}
    asset={$assetOut}
  />
  {#if dropdowns.settings}
    <Settings />
  {/if}
  {#if dropdowns.details}
    <Details
      asset={$assetOut}
      originationNetwork={originationChain}
      destinationNetwork={destinationChain}
    />
  {/if}
  <Version />
  <ConnectAndBridge />
  <div class="mt-3 text-center font-thin text-slate-500 text-sm">
    Estimated to completion is 30 minutes
  </div>
</div>

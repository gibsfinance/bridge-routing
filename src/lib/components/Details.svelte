<script lang="ts">
  import type { VisualChain } from '$lib/stores/auth/types'
  import {
    bridgeFrom,
    estimatedGas,
    incentiveFee,
    latestBaseFeePerGas,
    estimatedCost,
    limit,
    amountToBridge,
    fixedFee,
  } from '$lib/stores/bridge-settings'
  import { humanReadableNumber, type Asset } from '$lib/stores/utils'
  import { formatUnits } from 'viem'

  export let originationNetwork!: VisualChain
  export let destinationNetwork!: VisualChain
  $: bridgeFee = $bridgeFrom[originationNetwork.id][destinationNetwork.id].feeH2F
  const oneEther = 10n ** 18n
  $: afterBridge = $amountToBridge - ($amountToBridge * bridgeFee) / oneEther
  // $: estimatedCost = $fixedFee
  //   ? $limit
  //   : ($estimatedGas * $latestBaseFeePerGas * (oneEther + $incentiveFee)) / oneEther
  $: estimated = afterBridge - $estimatedCost
  $: minimumDelivered = afterBridge - $limit
  export let asset!: Asset
</script>

<div class="my-2 text-sm">
  <div class="bg-slate-100 rounded-t-lg py-2 px-4 justify-between flex flex-row">
    <span class="w-20">Amount In</span>
    <span>{humanReadableNumber($amountToBridge, asset.decimals)} {asset.symbol}</span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row">
    <span class="w-20">Bridged</span>
    <span class="flex flex-row justify-between grow">
      <span>0.3%</span>
      <span>{humanReadableNumber(afterBridge, asset.decimals)} {asset.symbol}</span>
    </span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row">
    <span class="w-20"
      >{#if !$fixedFee}Est.
      {/if}Cost</span
    >
    <span class="flex flex-row justify-between grow">
      <span
        >{#if !$fixedFee}
          ⛽&nbsp;+&nbsp;{formatUnits($incentiveFee * 100n, 18)}%{/if}</span
      >
      <span
        >{humanReadableNumber($estimatedCost, asset.decimals)}
        {asset.symbol}</span
      >
    </span>
  </div>
  {#if $fixedFee}
    <div class="bg-slate-100 mt-[1px] py-2 px-4 rounded-b-lg justify-between flex flex-row">
      <span class="w-20">Delivered</span>
      <span
        >{humanReadableNumber(minimumDelivered < 0n ? 0n : minimumDelivered, asset.decimals)}
        {asset.symbol}</span
      >
    </div>
  {:else}
    <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row">
      <span class="w-20">Est. Delivery</span>
      <span
        >~ {humanReadableNumber(estimated < 0n ? 0n : estimated, asset.decimals)}
        {asset.symbol}</span
      >
    </div>
    <div class="bg-slate-100 mt-[1px] py-2 px-4 rounded-b-lg justify-between flex flex-row">
      <span class="w-20">Minimum</span>
      <span class="flex flex-row justify-between grow">
        <span>&gt;=</span>
        <span
          >{humanReadableNumber(minimumDelivered < 0n ? 0n : minimumDelivered, asset.decimals)}
          {asset.symbol}</span
        >
      </span>
    </div>
  {/if}
</div>

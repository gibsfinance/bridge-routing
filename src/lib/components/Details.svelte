<script lang="ts">
  import type { VisualChain } from '$lib/stores/auth/types'
  import Warning from './Warning.svelte'
  import {
    bridgeFrom,
    incentiveFee,
    estimatedNetworkCost,
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
  $: estimated = afterBridge - $estimatedCost
  $: minimumDelivered = afterBridge - $limit
  export let asset!: Asset
</script>

<div class="my-2 text-sm shadow-md rounded-lg">
  <div class="bg-slate-100 rounded-t-lg py-2 px-4 justify-between flex flex-row">
    <span class="w-32">Amount In</span>
    <span>{humanReadableNumber($amountToBridge, asset.decimals)} {asset.symbol}</span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row">
    <span class="w-32">Bridged</span>
    <span class="flex flex-row justify-between grow">
      <span>0.3%</span>
      <span>{humanReadableNumber(afterBridge, asset.decimals)} {asset.symbol}</span>
    </span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row">
    <span class="w-32">Network</span>
    <span class="flex flex-row justify-between grow">
      <span>⛽</span>
      <span>
        {humanReadableNumber($estimatedNetworkCost, asset.decimals)}
        {asset.symbol}</span>
    </span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row relative">
    <span class="w-32">
      {#if !$fixedFee}Estimated
      {/if}Cost</span>
    <span class="flex flex-row justify-between grow">
      <span>
        {#if !$fixedFee}
          ⛽&nbsp;+&nbsp;{formatUnits($incentiveFee * 100n, 18)}%{/if}</span>
      <span>
        {humanReadableNumber($estimatedCost, asset.decimals)}
        {asset.symbol}</span>
    </span>
    <Warning
      show={$estimatedCost < $estimatedNetworkCost}
      tooltip="Network cost is higher than compensation. Validators may refuse to run tx under these conditions." />
  </div>
  {#if $fixedFee}
    <div
      class="bg-slate-100 mt-[1px] py-2 px-4 rounded-b-lg justify-between flex flex-row relative">
      <span class="w-32">Delivered</span>
      <span>
        {humanReadableNumber(minimumDelivered < 0n ? 0n : minimumDelivered, asset.decimals)}
        {asset.symbol}</span>
      <Warning
        show={minimumDelivered < ($amountToBridge / 10n) * 9n}
        tooltip="Many of your tokens are being lost to fees, try increasing the number of input tokens or decreasing the fee limits" />
    </div>
  {:else}
    <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row">
      <span class="w-32">Estimated Delivery</span>
      <span>
        ~ {humanReadableNumber(estimated < 0n ? 0n : estimated, asset.decimals)}
        {asset.symbol}</span>
    </div>
    <div
      class="bg-slate-100 mt-[1px] py-2 px-4 rounded-b-lg justify-between flex flex-row relative">
      <span class="w-32">Minimum</span>
      <span class="flex flex-row justify-between grow">
        <span>&gt;=</span>
        <span>
          {humanReadableNumber(minimumDelivered < 0n ? 0n : minimumDelivered, asset.decimals)}
          {asset.symbol}</span>
      </span>
      <Warning
        show={minimumDelivered < ($amountToBridge / 10n) * 9n}
        tooltip="Many of your tokens are being lost to fees, try increasing the number of input tokens or decreasing the fee limits" />
    </div>
  {/if}
</div>

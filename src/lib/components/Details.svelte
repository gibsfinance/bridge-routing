<script lang="ts">
  import * as viem from 'viem'
  import UndercompensatedWarning from '$lib/components/warnings/Undercompensated.svelte'
  import type { VisualChain } from '$lib/stores/auth/types'
  import Warning from './Warning.svelte'
  import {
    bridgeFrom,
    incentiveFee,
    estimatedNetworkCost,
    estimatedCost,
    limit,
    amountToBridge,
    feeType,
  } from '$lib/stores/bridge-settings'
  import { humanReadableNumber } from '$lib/stores/utils'
  import * as utils from '$lib/utils'
  import Loading from './Loading.svelte'
  import type { Token } from '$lib/types'

  export let originationNetwork!: VisualChain
  export let destinationNetwork!: VisualChain
  $: bridgeFee = $bridgeFrom.get(originationNetwork.chainId)!.get(destinationNetwork.chainId)!.feeH2F
  const oneEther = 10n ** 18n
  $: afterBridge = $amountToBridge - ($amountToBridge * bridgeFee) / oneEther
  $: estimated = afterBridge - $estimatedCost
  $: minimumDelivered = afterBridge - $limit
  export let asset!: Token
</script>

<div class="my-2 text-sm shadow-md rounded-lg">
  <div class="bg-slate-100 rounded-t-lg py-2 px-3 justify-between flex flex-row">
    <span class="w-32">Amount In</span>
    <span>{humanReadableNumber($amountToBridge, asset.decimals)} {asset.symbol}</span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row">
    <span class="w-32">Bridged</span>
    <span class="flex flex-row justify-between grow">
      <span>-{viem.formatEther(bridgeFee * 100n)}%</span>
      <span class="flex flex-row items-end self-end">
        <Loading key="gas">{humanReadableNumber(afterBridge, asset.decimals)}</Loading>&nbsp;{asset.symbol}
      </span>
    </span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row">
    <span class="w-32">Network</span>
    <span class="flex flex-row justify-between grow">
      <span>⛽</span>
      <span class="flex flex-row items-end self-end">
        <Loading key="gas">
          {humanReadableNumber($estimatedNetworkCost, asset.decimals)}
        </Loading>&nbsp;{utils.nativeSymbol(asset)}
      </span>
    </span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row relative">
    <span class="w-32">
      {#if $feeType === 'gas+%'}Estimated
      {/if}Cost
    </span>
    <span class="flex flex-row justify-between grow">
      <span>
        {#if $feeType === 'gas+%'}
          ⛽&nbsp;+&nbsp;{viem.formatEther($incentiveFee * 100n)}%{/if}
      </span>
      <span class="flex flex-row items-end self-end">
        <Loading key="gas">{humanReadableNumber($estimatedCost, asset.decimals)}</Loading>&nbsp;{utils.nativeSymbol(
          asset,
        )}
      </span>
    </span>
    <UndercompensatedWarning />
  </div>
  {#if $feeType !== 'gas+%'}
    <div class="bg-slate-100 mt-[1px] py-2 px-3 rounded-b-lg justify-between flex flex-row relative">
      <span class="w-32">Delivered</span>
      <span class="flex flex-row items-end self-end">
        <Loading key="gas">
          {humanReadableNumber(minimumDelivered < 0n ? 0n : minimumDelivered, asset.decimals)}
        </Loading>&nbsp;{utils.nativeSymbol(asset)}
      </span>
      <Warning
        show={minimumDelivered < ($amountToBridge / 10n) * 9n}
        tooltip="Many of your tokens are being lost to fees, try increasing the number of input tokens or decreasing the fee limits" />
    </div>
  {:else}
    <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row">
      <span class="w-32">Estimated Delivery</span>
      <span class="flex flex-row items-end self-end">
        ~&nbsp;<Loading key="gas">{humanReadableNumber(estimated < 0n ? 0n : estimated, asset.decimals)}</Loading
        >&nbsp;{utils.nativeSymbol(asset)}
      </span>
    </div>
    <div class="bg-slate-100 mt-[1px] py-2 px-3 rounded-b-lg justify-between flex flex-row relative">
      <span class="w-32">Minimum</span>
      <span class="flex flex-row justify-between grow">
        <span>&gt;=</span>
        <span class="flex flex-row items-end self-end">
          <Loading key="gas">
            {humanReadableNumber(minimumDelivered < 0n ? 0n : minimumDelivered, asset.decimals)}
          </Loading>&nbsp;{utils.nativeSymbol(asset)}
        </span>
      </span>
      <Warning
        show={minimumDelivered < ($amountToBridge / 10n) * 9n}
        tooltip="Many of your tokens are being lost to fees, try increasing the number of input tokens or decreasing the fee limits" />
    </div>
  {/if}
</div>

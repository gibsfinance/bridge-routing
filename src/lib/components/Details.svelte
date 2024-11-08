<script lang="ts">
  import { formatEther } from 'viem'
  import UndercompensatedWarning from '$lib/components/warnings/Undercompensated.svelte'
  import Warning from './Warning.svelte'
  import {
    estimatedNetworkCost,
    estimatedCost,
    limit,
    amountToBridge,
    limitFromPercent,
    unwrap,
  } from '$lib/stores/bridge-settings'
  import { humanReadableNumber } from '$lib/stores/utils'
  import * as utils from '$lib/utils'
  import Loading from './Loading.svelte'
  import type { TokenMetadata } from '$lib/types'
  import * as input from '$lib/stores/input'
  import { pathway } from '$lib/stores/config'
  import Hover from './Hover.svelte'
  import { hover } from '$lib/modifiers/hover'
  import Tooltip from './Tooltip.svelte'
  import { Chains } from '$lib/stores/auth/types'
  const { bridgeFee, bridgeKey, feeType, fee: inputFee } = input
  const oneEther = 10n ** 18n
  $: path = pathway($bridgeKey)
  $: fee = (path?.toHome ? $bridgeFee?.feeF2H : $bridgeFee?.feeH2F) || 0n
  $: afterBridge = $amountToBridge - ($amountToBridge * fee) / oneEther
  $: estimated = afterBridge - $estimatedCost
  $: minimumDelivered = afterBridge - $limit
  export let asset: TokenMetadata | null = null
  const fromChainId = input.fromChainId
</script>

<div class="my-2 text-sm shadow-md rounded-lg">
  {#if !!asset}
    <div class="bg-slate-100 rounded-t-lg py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Amount In</span>
      <span>{humanReadableNumber($amountToBridge, asset.decimals)} {asset.symbol}</span>
    </div>
    <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Bridged</span>
      <span class="flex flex-row justify-between grow">
        <span>-{formatEther(fee * 100n)}%</span>
        <span class="flex flex-row items-end self-end">
          <Loading key="gas">{humanReadableNumber(afterBridge, asset.decimals)}</Loading>&nbsp;{asset.symbol}
        </span>
      </span>
    </div>
    <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Network</span>
      <span class="flex flex-row justify-between grow">
        <span>⛽</span>
        <Hover let:handlers let:hovering>
          <span use:hover={handlers} class="flex flex-row items-end self-end relative">
            <Loading key="gas">
              {humanReadableNumber($estimatedNetworkCost, asset.decimals)}
            </Loading>&nbsp;{utils.nativeSymbol(asset, $unwrap)}
            <Tooltip positionFlow="above" position="left" show={hovering}
              >the estimated cost to put this transaction on chain in terms of the token being bridged at current gas
              rates</Tooltip>
          </span>
        </Hover>
      </span>
    </div>
    {#if $fromChainId === Chains.PLS || $fromChainId === Chains.V4PLS}
      <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row relative hover:z-10">
        <span class="w-32">
          {#if $feeType === 'gas+%'}Estimated
          {/if}Cost
        </span>
        <span class="flex flex-row justify-between grow">
          <span>
            {#if $feeType === 'gas+%'}
              ⛽&nbsp;+&nbsp;{$inputFee}%
            {:else if $feeType === input.FeeType.PERCENT}
              -{$inputFee}%
            {/if}
          </span>
          <Hover let:handlers let:hovering>
            <span
              use:hover={handlers}
              class="flex flex-row items-end self-end tooltip tooltip-top tooltip-left-toward-center relative">
              {#if $feeType === input.FeeType.PERCENT}
                {humanReadableNumber($limitFromPercent, asset.decimals)}
              {:else}<Loading key="gas">
                  {humanReadableNumber($estimatedCost, asset.decimals)}</Loading
                >{/if}&nbsp;{utils.nativeSymbol(asset, $unwrap)}
              <Tooltip show={hovering}>cost as configured by the fee settings</Tooltip>
            </span>
          </Hover>
        </span>
        <UndercompensatedWarning />
      </div>
    {/if}
    {#if $feeType !== 'gas+%'}
      <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row relative hover:z-10">
        <span class="w-32">Delivered</span>
        <span class="flex flex-row items-end self-end">
          <Loading key="gas">
            {humanReadableNumber(minimumDelivered < 0n ? 0n : minimumDelivered, asset.decimals)}
          </Loading>&nbsp;{utils.nativeSymbol(asset, $unwrap)}
        </span>
        <Warning
          show={minimumDelivered < ($amountToBridge / 10n) * 9n}
          tooltip="Many of your tokens are being lost to fees, try increasing the number of input tokens or decreasing the fee limits" />
      </div>
    {:else}
      <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10">
        <span class="w-32">Estimated Delivery</span>
        <span class="flex flex-row items-end self-end">
          ~&nbsp;<Loading key="gas">{humanReadableNumber(estimated < 0n ? 0n : estimated, asset.decimals)}</Loading
          >&nbsp;{utils.nativeSymbol(asset, $unwrap)}
        </span>
      </div>
      <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row relative hover:z-10">
        <span class="w-32">Minimum</span>
        <span class="flex flex-row justify-between grow">
          <span>&gt;=</span>
          <span class="flex flex-row items-end self-end">
            <Loading key="gas">
              {humanReadableNumber(minimumDelivered < 0n ? 0n : minimumDelivered, asset.decimals)}
            </Loading>&nbsp;{utils.nativeSymbol(asset, $unwrap)}
          </span>
        </span>
        <Warning
          show={minimumDelivered < ($amountToBridge / 10n) * 9n}
          tooltip="Many of your tokens are being lost to fees, try increasing the number of input tokens or decreasing the fee limits" />
      </div>
    {/if}
    <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10 rounded-b-lg">
      <span class="w-32">Equation</span>
      <span class="flex flex-row justify-end grow">
        <span class="flex flex-row items-end self-end font-mono text-right">
          (in-{formatEther(
            fee * 100n,
          )}%)-{#if $feeType === input.FeeType.FIXED}fixed=out{:else if $feeType === input.FeeType.GAS_TIP}min(limit,base*{$inputFee}%)=out{:else if $feeType === input.FeeType.PERCENT}{$inputFee}%=out
          {/if}
        </span>
      </span>
    </div>
  {/if}
</div>

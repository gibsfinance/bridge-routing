<script lang="ts">
  import { formatEther } from 'viem'
  import UndercompensatedWarning from '$lib/components/warnings/Undercompensated.svelte'
  import Warning from './Warning.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { humanReadableNumber } from '$lib/stores/utils'
  import * as utils from '$lib/utils.svelte'
  import Loading from './Loading.svelte'
  import type { TokenMetadata } from '$lib/types.svelte'
  import * as input from '$lib/stores/input.svelte'
  import Tooltip from './Tooltip.svelte'
  import { Chains } from '$lib/stores/auth/types'
  const { bridgeKey, feeType, fee: inputFee, shouldDeliver } = input
  const oneEther = 10n ** 18n
  const path = $derived(bridgeKey.pathway)
  const fee = $derived(
    (path?.toHome ? bridgeSettings.bridgeFees?.feeF2H : bridgeSettings.bridgeFees?.feeH2F) || 0n,
  )
  const afterBridge = $derived(
    bridgeSettings.amountToBridge - (bridgeSettings.amountToBridge * fee) / oneEther,
  )
  const estimated = $derived(
    shouldDeliver ? afterBridge - bridgeSettings.estimatedCost : afterBridge,
  )
  const minimumDelivered = $derived(
    shouldDeliver ? afterBridge - bridgeSettings.limit : afterBridge,
  )
  const fromChainId = $derived(bridgeKey.fromChain)
  type Props = {
    asset: TokenMetadata | null
  }
  const { asset }: Props = $props()
</script>

<div class="my-2 text-sm shadow-sm rounded-lg hover:shadow transition-shadow">
  {#if !!asset}
    <div class="bg-slate-50 rounded-t-lg py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Amount In</span>
      <span
        >{humanReadableNumber(bridgeSettings.amountToBridge, asset.decimals)} {asset.symbol}</span>
    </div>
    <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Bridged</span>
      <span class="flex flex-row justify-between grow">
        <span>-{formatEther(fee * 100n)}%</span>
        <span class="flex flex-row items-end self-end">
          <Loading key="gas">
            {#snippet contents()}{humanReadableNumber(afterBridge, asset.decimals)}{/snippet}
          </Loading>&nbsp;{asset.symbol}
        </span>
      </span>
    </div>
    <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Network</span>
      <span class="flex flex-row justify-between grow">
        <span>⛽</span>
        <Tooltip
          tooltip="the estimated cost to put this transaction on chain in terms of the token being
              bridged at current gas rates"
          placement="left">
          <span class="flex flex-row items-end self-end relative">
            <Loading key="gas">
              {#snippet contents()}{humanReadableNumber(
                  shouldDeliver.value ? bridgeSettings.estimatedNetworkCost : 0n,
                  asset.decimals,
                )}{/snippet}
            </Loading>&nbsp;{utils.nativeSymbol(asset, bridgeSettings.unwrap)}
          </span>
        </Tooltip>
      </span>
    </div>
    {#if bridgeKey.fromChain === Chains.PLS || bridgeKey.fromChain === Chains.V4PLS}
      <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row relative hover:z-10">
        <span class="w-32">
          {#if feeType.value === input.FeeType.GAS_TIP}Estimated
          {/if}Cost
        </span>
        <span class="flex flex-row justify-between grow">
          <span>
            {#if feeType.value === input.FeeType.GAS_TIP}
              ⛽&nbsp;+&nbsp;{input.fee.value}%
            {:else if feeType.value === input.FeeType.PERCENT}
              -{input.fee.value}%
            {/if}
          </span>
          <Tooltip tooltip="cost as configured by the fee settings">
            <span
              class="flex flex-row items-end self-end tooltip tooltip-top tooltip-left-toward-center relative">
              {#if feeType.value === input.FeeType.PERCENT}
                {humanReadableNumber(bridgeSettings.limitFromPercent, asset.decimals)}
              {:else}<Loading key="gas"
                  >{#snippet contents()}{humanReadableNumber(
                      bridgeSettings.estimatedCost,
                      asset.decimals,
                    )}{/snippet}</Loading
                >{/if}&nbsp;{utils.nativeSymbol(asset, bridgeSettings.unwrap)}
            </span>
          </Tooltip>
        </span>
        <UndercompensatedWarning />
      </div>
    {/if}
    {#if feeType.value !== input.FeeType.GAS_TIP}
      <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row relative hover:z-10">
        <span class="w-32">Delivered</span>
        <span class="flex flex-row items-end self-end">
          <Loading key="gas">
            {#snippet contents()}{humanReadableNumber(
                minimumDelivered < 0n ? 0n : minimumDelivered,
                asset.decimals,
              )}{/snippet}
          </Loading>&nbsp;{utils.nativeSymbol(asset, bridgeSettings.unwrap)}
        </span>
        <Warning
          show={minimumDelivered < (bridgeSettings.amountToBridge / 10n) * 9n}
          tooltip="Many of your tokens are being lost to fees, try increasing the number of input tokens or decreasing the fee limits" />
      </div>
    {:else}
      <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10">
        <span class="w-32">Estimated Delivery</span>
        <span class="flex flex-row items-end self-end">
          ~&nbsp;<Loading key="gas"
            >{#snippet contents()}{humanReadableNumber(
                estimated < 0n ? 0n : estimated,
                asset.decimals,
              )}{/snippet}</Loading
          >&nbsp;{utils.nativeSymbol(asset, bridgeSettings.unwrap)}
        </span>
      </div>
      <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row relative hover:z-10">
        <span class="w-32">Minimum</span>
        <span class="flex flex-row justify-between grow">
          <span>&gt;=</span>
          <span class="flex flex-row items-end self-end">
            <Loading key="gas">
              {#snippet contents()}{humanReadableNumber(
                  minimumDelivered < 0n ? 0n : minimumDelivered,
                  asset.decimals,
                )}{/snippet}
            </Loading>&nbsp;{utils.nativeSymbol(asset, bridgeSettings.unwrap)}
          </span>
        </span>
        <Warning
          show={minimumDelivered < (bridgeSettings.amountToBridge / 10n) * 9n}
          tooltip="Many of your tokens are being lost to fees, try increasing the number of input tokens or decreasing the fee limits" />
      </div>
    {/if}
    <div
      class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10 rounded-b-lg">
      <span class="w-32">Equation</span>
      <span class="flex flex-row justify-end grow">
        <span class="flex flex-row items-end self-end font-mono text-right">
          (in-{formatEther(
            fee * 100n,
          )}%)-{#if feeType.value === input.FeeType.FIXED}fixed=out{:else if feeType.value === input.FeeType.GAS_TIP}min(limit,base*{input
              .fee.value}%)=out{:else if feeType.value === input.FeeType.PERCENT}{input.fee
              .value}%=out
          {/if}
        </span>
      </span>
    </div>
  {/if}
</div>

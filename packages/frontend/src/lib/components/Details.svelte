<script lang="ts">
  import { FeeType } from '@gibs/bridge-sdk/fee-type'
  import { formatEther } from 'viem'
  import type { TokenMetadata } from '@gibs/bridge-sdk/types'
  import { Chains } from '@gibs/bridge-sdk/config'
  import { nativeSymbol } from '@gibs/bridge-sdk/chain-info'

  import { bridgeSettings } from '../stores/bridge-settings.svelte'
  import * as utils from '../utils.svelte'
  import * as input from '../stores/input.svelte'
  import { humanReadableNumber } from '../stores/utils'

  import UndercompensatedWarning from './warnings/Undercompensated.svelte'
  import Warning from './Warning.svelte'
  import Loading from './Loading.svelte'
  import Tooltip from './Tooltip.svelte'

  const { bridgeKey, shouldDeliver } = input
  const feeType = $derived(bridgeSettings.feeType)
  const oneEther = 10n ** 18n
  const path = $derived(bridgeKey.pathway)
  const fee = $derived(
    (path?.toHome ? bridgeSettings.bridgeFees?.feeF2H : bridgeSettings.bridgeFees?.feeH2F) || 0n,
  )
  const afterBridge = $derived(
    bridgeSettings.amountToBridge - (bridgeSettings.amountToBridge * fee) / oneEther,
  )
  const estimated = $derived(
    shouldDeliver ? afterBridge - (bridgeSettings.estimatedCost ?? 0n) : afterBridge,
  )
  const minimumDelivered = $derived(
    shouldDeliver ? afterBridge - bridgeSettings.limit : afterBridge,
  )
  type Props = {
    asset: TokenMetadata | null
  }
  const { asset }: Props = $props()
</script>

<div class="my-2 text-sm shadow-xs rounded-lg hover:shadow-sm transition-shadow">
  {#if !!asset}
    <div class="bg-slate-50 rounded-t-lg py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Amount In</span>
      <span
        >{humanReadableNumber(bridgeSettings.amountToBridge, {
          decimals: asset.decimals,
        })}
        {asset.symbol}</span>
    </div>
    <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Bridged</span>
      <span class="flex flex-row justify-between grow">
        <span>-{formatEther(fee * 100n)}%</span>
        <span class="flex flex-row items-end self-end">
          <Loading key="gas">
            {#snippet contents()}{humanReadableNumber(afterBridge, {
                decimals: asset.decimals,
              })}{/snippet}
          </Loading>&nbsp;{asset.symbol}
        </span>
      </span>
    </div>
    <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row hover:z-10">
      <span class="w-32">Network</span>
      <span class="flex flex-row justify-between grow">
        <span>⛽</span>
        <Tooltip placement="left">
          {#snippet trigger()}
            <span class="flex flex-row items-end self-end relative">
              <Loading key="gas">
                {#snippet contents()}{humanReadableNumber(
                    shouldDeliver.value ? (bridgeSettings.estimatedTokenNetworkCost ?? 0n) : 0n,
                    { decimals: asset.decimals },
                  )}{/snippet}
              </Loading>&nbsp;{nativeSymbol(asset, bridgeSettings.unwrap)}
            </span>
          {/snippet}
          {#snippet content()}
            the estimated cost to put this transaction on chain in terms of the token being bridged
            at current gas rates
          {/snippet}
        </Tooltip>
      </span>
    </div>
    {#if bridgeKey.fromChain === Chains.PLS || bridgeKey.fromChain === Chains.V4PLS}
      <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row relative hover:z-10">
        <span class="w-32">
          {#if feeType === FeeType.GAS_TIP}Estimated
          {/if}Cost
        </span>
        <span class="flex flex-row justify-between grow">
          <span>
            {#if feeType === FeeType.GAS_TIP}
              ⛽&nbsp;+&nbsp;{input.gasTipFee.value}%
            {:else if feeType === FeeType.PERCENT}
              -{input.percentFee.value}%
            {/if}
          </span>
          <Tooltip tooltip="cost as configured by the fee settings">
            {#snippet trigger()}
              <span
                class="flex flex-row items-end self-end tooltip tooltip-top tooltip-left-toward-center relative">
                {#if feeType === FeeType.PERCENT}
                  {humanReadableNumber(bridgeSettings.estimatedCost ?? 0n, {
                    decimals: asset.decimals,
                  })}
                {:else}<Loading key="gas"
                    >{#snippet contents()}{humanReadableNumber(bridgeSettings.estimatedCost ?? 0n, {
                        decimals: asset.decimals,
                      })}{/snippet}</Loading
                  >{/if}&nbsp;{nativeSymbol(asset, bridgeSettings.unwrap)}
              </span>
            {/snippet}
            {#snippet content()}
              the estimated cost to put this transaction on chain in terms of the token being
              bridged at current gas rates
            {/snippet}
          </Tooltip>
        </span>
        <UndercompensatedWarning />
      </div>
    {/if}
    {#if feeType !== FeeType.GAS_TIP}
      <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row relative hover:z-10">
        <span class="w-32">Delivered</span>
        <span class="flex flex-row items-end self-end">
          <Loading key="gas">
            {#snippet contents()}{humanReadableNumber(
                minimumDelivered < 0n ? 0n : minimumDelivered,
                { decimals: asset.decimals },
              )}{/snippet}
          </Loading>&nbsp;{nativeSymbol(asset, bridgeSettings.unwrap)}
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
            >{#snippet contents()}{humanReadableNumber(estimated < 0n ? 0n : estimated, {
                decimals: asset.decimals,
              })}{/snippet}</Loading
          >&nbsp;{nativeSymbol(asset, bridgeSettings.unwrap)}
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
                  { decimals: asset.decimals },
                )}{/snippet}
            </Loading>&nbsp;{nativeSymbol(asset, bridgeSettings.unwrap)}
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
          )}%)-{#if feeType === FeeType.FIXED}fixed=out{:else if feeType === FeeType.GAS_TIP}min(limit,base*{input
              .gasTipFee.value}%)=out{:else if feeType === FeeType.PERCENT}{input.percentFee
              .value}%=out
          {/if}
        </span>
      </span>
    </div>
  {/if}
</div>

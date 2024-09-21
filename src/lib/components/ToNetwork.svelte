<script lang="ts">
  import * as input from '$lib/stores/input'
  import { createEventDispatcher } from 'svelte'
  import { formatUnits, parseEther } from 'viem'
  import NetworkSummary from './NetworkSummary.svelte'
  import { humanReadableNumber } from '$lib/stores/utils'
  import Loading from '$lib/components/Loading.svelte'
  import LockIcon from '$lib/components/LockIcon.svelte'
  import { windowStore } from '$lib/stores/window'
  import UndercompensatedWarning from '$lib/components/warnings/Undercompensated.svelte'
  import FeeTypeToggle from '$lib/components/FeeTypeToggle.svelte'
  import {
    limitFromPercent,
    priceCorrective,
    amountAfterBridgeFee,
    estimatedCost,
    unwrap,
    amountToBridge,
    estimatedNetworkCost,
    fee,
    oneEther,
    desiredExcessCompensationPercentage,
    toTokenBalance,
    bridgeFee,
  } from '$lib/stores/bridge-settings'
  import { latestBaseFeePerGas } from '$lib/stores/chain-events'
  import type { VisualChain } from '$lib/stores/auth/types'
  import SmallInput from './SmallInput.svelte'
  import * as utils from '$lib/utils'
  import type { Token } from '$lib/types'
  import Tooltip from './Tooltip.svelte'
  import { hover } from '$lib/modifiers/hover'
  import Hover from './Hover.svelte'
  export let destinationNetwork!: VisualChain
  export let asset!: Token

  const { feeType, assetInAddress, destinationSupportsEIP1559, bridgePathway } = input
  const dispatch = createEventDispatcher()
  const showToolbox = (type: string) => {
    dispatch('toggle', type)
  }
  // lock toggles
  let costLimitLocked = false
  let deliveryFeeLocked = false
  // fee math constants
  const scaledBasisPoint = parseEther('0.01')
  const max = parseEther('10')
  const min = parseEther('0.05')
  const percentFeeFromNetworkInputs = () => {
    if (!$amountAfterBridgeFee || !$estimatedNetworkCost) {
      return 0n
    }
    const ratioOffset = ($estimatedNetworkCost * 25_000n) / $amountAfterBridgeFee
    let target = min + scaledBasisPoint * ratioOffset
    if (target > max) {
      target = max
    } else if (target < min) {
      target = min
    }
    return formatUnits(target, 18)
  }
  const gasPercentFeeFromNetworkInputs = () => {
    if ($priceCorrective === 0n) {
      return
    }
    const numDecimals = 6n
    const lowResLimit = ($latestBaseFeePerGas * ($fee + oneEther)) / (10n ** (11n - numDecimals) * 10n * oneEther)
    let lim = lowResLimit * 10n ** (18n - numDecimals)
    lim = (lim * oneEther) / $priceCorrective / (oneEther / 10n ** BigInt(asset.decimals))
    if (lim > $amountAfterBridgeFee) {
      lim = $amountAfterBridgeFee
    }
    return humanReadableNumber(lim, asset.decimals)
  }
  const reflowFees = () => {
    if (!$bridgePathway?.requiresDelivery) {
      input.fee.set('0')
      return
    }
    if ($feeType === input.FeeType.PERCENT) {
      if (!deliveryFeeLocked) {
        input.fee.set(percentFeeFromNetworkInputs() || $desiredExcessCompensationPercentage)
      }
    }
    if ($feeType === input.FeeType.GAS_TIP || $feeType === input.FeeType.FIXED) {
      if (!costLimitLocked) {
        const floatingLimit = gasPercentFeeFromNetworkInputs()
        if (floatingLimit) {
          input.limit.set(floatingLimit)
        }
      }
    } else {
      input.limit.set(formatUnits(($amountAfterBridgeFee * $fee) / oneEther, asset.decimals))
    }
  }
  const feeTypeOptions = [
    { key: input.FeeType.FIXED, text: 'Fixed' },
    { key: input.FeeType.GAS_TIP, text: '⛽+%' },
    { key: input.FeeType.PERCENT, text: '%' },
  ]
  $: if (asset && $feeType === input.FeeType.GAS_TIP) {
    input.limit.set(gasPercentFeeFromNetworkInputs() || '10')
  }
  $: console.log(
    deliveryFeeLocked || !deliveryFeeLocked,
    costLimitLocked || !costLimitLocked,
    $amountToBridge || !$amountToBridge,
    $fee || !$fee,
    $feeType,
    $assetInAddress,
  )
  $: if (
    (deliveryFeeLocked || !deliveryFeeLocked) &&
    (costLimitLocked || !costLimitLocked) &&
    ($amountToBridge || !$amountToBridge) &&
    ($fee || !$fee) &&
    $feeType &&
    $assetInAddress
  ) {
    reflowFees()
  }
  const focusOnInputChild = (e: any) => {
    e.currentTarget.querySelector('input')?.focus()
  }

  $: bridgeFeeDecimals = humanReadableNumber($bridgeFee * 100n)
  $: decimals = asset.decimals
  $: large = $windowStore.innerHeight > 600 && $windowStore.innerWidth >= 768
  $: expectedAmountOut =
    $amountToBridge &&
    humanReadableNumber(
      $amountAfterBridgeFee - $estimatedCost > 0n ? $amountAfterBridgeFee - $estimatedCost : 0n,
      decimals,
      null,
      true,
    )
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg hover:z-10">
    <NetworkSummary network={destinationNetwork} inChain={false} {asset} balance={$toTokenBalance} unwrap={$unwrap} />
  </div>
  <div class="bg-slate-100 mt-[1px] py-1">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <span>Bridge Fee</span>
      <Hover let:handlers let:hovering>
        <span
          use:hover={handlers}
          class="cursor-not-allowed tooltip tooltip-top tooltip-left-toward-center flex items-end self-end relative">
          <Tooltip show={hovering}>Fee set on the bridge</Tooltip>
          <Loading key="fee">{bridgeFeeDecimals}</Loading>%
        </span>
      </Hover>
    </div>
  </div>
  <div class="bg-slate-100 mt-[1px] py-1 relative hover:z-10">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <span class="flex items-center">
        <span class="mr-1"
          >{#if large}Delivery Fee{:else}Deliv.{/if}</span
        >&nbsp;
        <FeeTypeToggle
          active={$feeType}
          options={feeTypeOptions}
          on:change={(e) => {
            feeType.set(e.detail.key)
            input.fee.set($desiredExcessCompensationPercentage)
          }} />{#if $feeType === input.FeeType.PERCENT}<button
            type="button"
            name="toggle-delivery-fee"
            class="flex px-1"
            on:click={() => {
              deliveryFeeLocked = !deliveryFeeLocked
            }}><LockIcon locked={deliveryFeeLocked} /></button
          >{/if}
      </span>
      <Hover let:handlers let:hovering>
        <button
          use:hover={handlers}
          type="button"
          name="fee-amount"
          class="flex flex-row strike tooltip tooltip-top tooltip-left-toward-center items-center relative"
          class:line-through={$feeType === input.FeeType.FIXED}
          on:click={focusOnInputChild}>
          <Tooltip show={hovering} positionFlow="above"
            >{$feeType === input.FeeType.FIXED
              ? 'Fee uses fixed value defined in cost limit'
              : $feeType === input.FeeType.GAS_TIP
                ? `Percentage of gas used * ${$destinationSupportsEIP1559 ? 'base fee' : 'gas price'} to allocate to the transaction runner for performing this action\ncurrently: ${humanReadableNumber($estimatedNetworkCost, asset.decimals)} ${utils.nativeSymbol(asset, $unwrap)}`
                : 'the percentage of bridged tokens after the bridge fee'}</Tooltip>
          <Loading key="gas" />
          {#if $feeType !== input.FeeType.FIXED}
            <span class:hidden={$feeType !== input.FeeType.GAS_TIP}>⛽&nbsp;+</span><SmallInput
              value={input.fee}
              suffix="%"
              on:input={() => {
                deliveryFeeLocked = true
              }} />
          {/if}
        </button>
      </Hover>
    </div>
    <UndercompensatedWarning />
  </div>
  <div class="bg-slate-100 mt-[1px] py-1 relative hover:z-10">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <Hover let:hovering let:handlers>
        <button
          use:hover={handlers}
          type="button"
          name="toggle-cost-limit"
          class="tooltip tooltip-top tooltip-right-toward-center relative"
          on:click={() => {
            costLimitLocked = !costLimitLocked
          }}>
          Cost&nbsp;{#if $feeType === input.FeeType.GAS_TIP || $feeType === input.FeeType.FIXED}Limit&nbsp;<LockIcon
              locked={costLimitLocked} />{/if}
          <Tooltip position="right" positionFlow="above" show={hovering}
            >Allows cost limit to float with the destination chain's base fee. While unlocked the number in the ui may
            change. Once a transaction is sent, the number in that transaction's calldata is fixed</Tooltip>
        </button>
      </Hover>
      <Hover let:hovering let:handlers>
        <button
          use:hover={handlers}
          type="button"
          name="cost-limit"
          class="flex flex-row items-end self-end relative"
          on:click={focusOnInputChild}>
          <Loading key="gas">
            {#if $feeType === input.FeeType.PERCENT}
              <span>{humanReadableNumber($limitFromPercent, asset.decimals)} {utils.nativeSymbol(asset, $unwrap)}</span>
            {:else}
              <SmallInput
                value={input.limit}
                suffix="&nbsp;{utils.nativeSymbol(asset, $unwrap)}"
                on:input={() => {
                  costLimitLocked = true
                }} />
            {/if}
          </Loading>
          <Tooltip positionFlow="above" position="left" show={hovering}
            >{$feeType === input.FeeType.FIXED || $feeType === input.FeeType.PERCENT
              ? 'The fixed fee to tip if the validator does the work'
              : 'The max you are willing to tip to the address'}</Tooltip>
        </button>
      </Hover>
    </div>
  </div>
  <div class="rounded-b-lg bg-slate-100 mt-[1px] py-1 hover:z-10">
    <div class="flex flex-row px-3 leading-10 justify-between">
      <div class="flex flex-row">
        <button type="button" name="transaction-settings" class="flex mr-2" on:click={() => showToolbox('settings')}
          >⚙️</button>
        <button type="button" name="transaction-details" class="flex" on:click={() => showToolbox('details')}
          >📐</button>
      </div>
      <span class="text-xl sm:text-2xl leading-10 flex items-center self-center">
        {#if $feeType === input.FeeType.GAS_TIP}~&nbsp;{/if}<Loading key="gas">
          {expectedAmountOut}
        </Loading>&nbsp;{utils.nativeSymbol(asset, $unwrap)}
        <Tooltip
          >Estimated tokens to be delivered. If the base fee is used, then this value will change as the base fee
          fluctuates on ethereum</Tooltip>
      </span>
    </div>
  </div>
</div>

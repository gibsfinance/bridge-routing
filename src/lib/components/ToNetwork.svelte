<script lang="ts">
  import * as input from '$lib/stores/input.svelte'
  import { assetSources, bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import SectionInput from './SectionInput.svelte'
  import type { Token } from '$lib/types.svelte'
  type Props = {
    asset: Token | null
  }
  const { asset = null }: Props = $props()
  // const feeTypeOptions = [
  //   { key: input.FeeType.FIXED, text: 'Fixed' },
  //   { key: input.FeeType.GAS_TIP, text: '⛽+%' },
  //   { key: input.FeeType.PERCENT, text: '%' },
  // ]
  // $effect(() => {
  //   if (asset && feeType.value === input.FeeType.GAS_TIP) {
  //     input.limit.value = gasPercentFeeFromNetworkInputs() || 10n * oneEther
  //   }
  // })
  // $effect(() => {
  //   if (
  //     (deliveryFeeLocked || !deliveryFeeLocked) &&
  //     (costLimitLocked || !costLimitLocked) &&
  //     (bridgeSettings.amountToBridge || !bridgeSettings.amountToBridge) &&
  //     (bridgeSettings.fee || !bridgeSettings.fee) &&
  //     feeType.value &&
  //     bridgeSettings.assetInAddress
  //   ) {
  //     reflowFees()
  //   }
  // })
  // const focusOnInputChild = (e: any) => {
  //   e.currentTarget.querySelector('input')?.focus()
  // }

  // const bridgeFeeDecimals = $derived(humanReadableNumber(feeToCrossBridge * 100n))
  // const decimals = $derived(asset?.decimals || 18)
  // const large = $derived(!!innerWidth.current && innerWidth.current >= 512)
  // const expectedAmountOut = $derived(
  //   bridgeSettings.amountToBridge &&
  //     humanReadableNumber(
  //       bridgeSettings.amountAfterBridgeFee - bridgeSettings.estimatedCost > 0n
  //         ? bridgeSettings.amountAfterBridgeFee - bridgeSettings.estimatedCost
  //         : 0n,
  //       {
  //         decimals,
  //         decimalCount: null,
  //         truncLen: true,
  //       },
  //     ),
  // )
  const fromChainId = $derived(input.bridgeKey.fromChain)
  const out = $derived({
    ...asset,
    logoURI: assetSources(asset, [`${fromChainId}/${bridgeSettings.assetInAddress}`]),
  } as Token)
  // $effect(() => {
  //   const amountIn = bridgeSettings.amountToBridge
  // if (!) return
  // const amountOut = (amountIn * (10000n + bridgeSettings.desiredExcessCompensationBasisPoints)) / 10000n
  // bridgeSettings.amountToBridge = amountOut
  // })
  // const gasIsLoading = $derived(!loading.resolved)
</script>

{#if out}
  <SectionInput
    label="Output"
    token={out}
    focused
    value={bridgeSettings.amountToBridge}
    readonlyInput
    readonlyTokenSelect
    onbalanceupdate={() => {}}>
  </SectionInput>
{/if}

<!--
<div class="shadow-xs rounded-lg hover:shadow-sm transition-shadow">
  <div class="bg-slate-50 py-2 px-3 rounded-t-lg hover:z-10">
    <NetworkSummary
      network={destinationNetwork}
      inChain={false}
      asset={out}
      balance={toTokenBalance.value}
      {unwrap} />
  </div>
  <div class="bg-slate-50 mt-[1px] py-1">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <span>Bridge Fee</span>
      <Tooltip tooltip="Fee set on the bridge" placement="left">
        <span class="flex flex-row items-center align-baseline gap-1"
          ><Loading key="bridge-fee">
            {#snippet contents()}{bridgeFeeDecimals}{/snippet}
          </Loading>%</span>
      </Tooltip>
    </div>
  </div>
  {#if fromChainId === Chains.PLS || fromChainId === Chains.V4PLS}
    <div class="bg-slate-50 mt-[1px] py-1 relative hover:z-10">
      <div class="flex flex-row px-3 leading-8 justify-between">
        <span class="flex items-center flex-row gap-2">
          <span
            >{#if large}Delivery{:else}Deliv.{/if}</span
          ><SlideToggle
            checked={shouldDeliver.value}
            onchange={({ checked }) => {
              shouldDeliver.value = checked
            }} />
          <FeeTypeToggle
            active={feeType.value}
            options={feeTypeOptions}
            onchange={(e) => {
              feeType.value = e.key as input.FeeType
              input.fee.value = bridgeSettings.desiredExcessCompensationPercentage
            }} />{#if feeType.value === input.FeeType.PERCENT}<button
              type="button"
              name="toggle-delivery-fee"
              class="flex px-1"
              onclick={() => {
                deliveryFeeLocked = !deliveryFeeLocked
              }}><LockIcon locked={deliveryFeeLocked} /></button
            >{/if}
        </span>
        {#if shouldDeliver.value}
          <Tooltip
            placement="top"
            tooltip={feeType.value === input.FeeType.FIXED
              ? 'Fee uses fixed value defined in cost limit'
              : feeType.value === input.FeeType.GAS_TIP
                ? `Percentage of gas used * ${input.bridgeKey.destinationSupportsEIP1559 ? 'base fee' : 'gas price'} to allocate to the transaction runner for performing this action\ncurrently: ${humanReadableNumber(
                    bridgeSettings.estimatedNetworkCost,
                    {
                      decimals: asset?.decimals || 18,
                    },
                  )} ${utils.nativeSymbol(asset, unwrap)}`
                : 'The percentage of bridged tokens after the bridge fee'}>
            <button
              type="button"
              name="fee-amount"
              class="flex flex-row strike tooltip tooltip-top tooltip-left-toward-center items-center relative"
              class:line-through={feeType.value === input.FeeType.FIXED}
              onclick={focusOnInputChild}>
              {#if feeType.value !== input.FeeType.FIXED}
                {@const decimals = bridgeSettings.assetIn.value?.decimals || 18}
                <span class:hidden={feeType.value !== input.FeeType.GAS_TIP}>⛽&nbsp;+</span><span
                  class="flex items-center"
                  class:opacity-60={gasIsLoading}
                  ><SmallInput
                    value={input.fee.value ? formatUnits(input.fee.value, decimals) : ''}
                    class="focus:ring-0 border-none"
                    inputClass="text-lg"
                    suffix="%"
                    oninput={(e) => {
                      deliveryFeeLocked = true
                      input.fee.value = parseUnits(e, decimals)
                    }} />
                </span>
              {/if}
            </button>
          </Tooltip>
        {:else}
          <span class="flex items-end self-end">0.0%</span>
        {/if}
      </div>
      <UndercompensatedWarning />
    </div>
    <div class="bg-slate-50 mt-[1px] py-1 relative hover:z-10">
      <div class="flex flex-row px-3 leading-8 justify-between">
        <Tooltip
          placement="top"
          tooltip={"Allows cost limit to float with the destination chain's base fee. While unlocked the number in the ui may change. Once a transaction is sent, the number in that transaction's calldata is fixed"}>
          <button
            type="button"
            name="toggle-cost-limit"
            class="tooltip tooltip-top tooltip-right-toward-center relative"
            onclick={() => {
              costLimitLocked = !costLimitLocked
            }}>
            Cost&nbsp;{#if feeType.value === input.FeeType.GAS_TIP || feeType.value === input.FeeType.FIXED}Limit&nbsp;<LockIcon
                locked={costLimitLocked} />{/if}
          </button>
        </Tooltip>
        {#if shouldDeliver.value}
          <Tooltip
            placement="top"
            tooltip={feeType.value === input.FeeType.FIXED ||
            feeType.value === input.FeeType.PERCENT
              ? 'The fixed fee to tip if the validator does the work'
              : 'The max you are willing to tip to the address'}>
            <span class="flex items-center" class:opacity-60={gasIsLoading}>
              {#if feeType.value === input.FeeType.PERCENT}
                <span
                  >{humanReadableNumber(bridgeSettings.limitFromPercent, {
                    decimals: asset?.decimals || 18,
                  })}
                  {utils.nativeSymbol(asset, unwrap)}</span>
              {:else}
                <SmallInput
                  value={input.limit.value ? formatUnits(input.limit.value, decimals) : ''}
                  suffix="&nbsp;{utils.nativeSymbol(asset, unwrap)}"
                  oninput={(e) => {
                    costLimitLocked = true
                    input.limit.value = parseUnits(e, decimals)
                  }} />
              {/if}
            </span>
          </Tooltip>
        {:else}
          <span class="flex items-end self-end">
            <span>0.0&nbsp;{utils.nativeSymbol(asset, unwrap)}</span>
          </span>
        {/if}
      </div>
    </div>
  {/if}
  <div class="rounded-b-lg bg-slate-50 mt-[1px] py-1 hover:z-10">
    <div class="flex flex-row px-3 leading-10 justify-between">
      <div class="flex flex-row">
        <button
          type="button"
          name="transaction-settings"
          class="flex mr-2"
          onclick={() => showToolbox('settings')}>⚙️</button>
        <button
          type="button"
          name="transaction-details"
          class="flex"
          onclick={() => showToolbox('details')}>📐</button>
      </div>
      <Tooltip
        placement="top"
        tooltip="Estimated tokens to be delivered. If the base fee is used, then this value will change as the base fee fluctuates on ethereum">
        <span class="text-xl sm:text-2xl leading-10 flex items-center self-center">
          {#if feeType.value === input.FeeType.GAS_TIP}~&nbsp;{/if}
          <span class="flex items-center" class:opacity-60={gasIsLoading}>
            {expectedAmountOut}
          </span>&nbsp;{utils.nativeSymbol(asset, unwrap)}
        </span>
      </Tooltip>
    </div>
  </div>
</div> -->

<script lang="ts">
  import { untrack } from 'svelte'
  import Button from './Button.svelte'
  import Section from './Section.svelte'
  import NumericInput from './NumericInput.svelte'
  import * as input from '$lib/stores/input.svelte'
  import { formatEther, formatUnits, parseEther, parseUnits } from 'viem'
  import NetworkSummary from './NetworkSummary.svelte'
  import { humanReadableNumber } from '$lib/stores/utils'
  import Loading from '$lib/components/Loading.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import LockIcon from '$lib/components/LockIcon.svelte'
  import { innerWidth } from 'svelte/reactivity/window'
  import UndercompensatedWarning from '$lib/components/warnings/Undercompensated.svelte'
  import FeeTypeToggle from '$lib/components/FeeTypeToggle.svelte'
  import { assetSources, bridgeSettings, oneEther } from '$lib/stores/bridge-settings.svelte'
  import { toTokenBalance } from '$lib/stores/chain-events.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import SmallInput from './SmallInput.svelte'
  import * as utils from '$lib/utils.svelte'
  import type { Token, TokenOut } from '$lib/types.svelte'
  import Tooltip from './Tooltip.svelte'
  import SlideToggle from './SlideToggle.svelte'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import type { EventHandler } from 'svelte/elements'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import { bridgeSettings as storageBridgeSettings } from '$lib/stores/storage.svelte'
  import Settings from './Settings.svelte'
  import ButtonToggle from './ButtonToggle.svelte'
  type Props = {
    // ontoggle: (type: string) => void
    asset: Token | null
  }
  const { shouldDeliver } = input
  const { asset = null }: Props = $props()
  // const feeToCrossBridge = $derived(bridgeSettings.bridgeFee)
  const destinationNetwork = $derived(bridgeKey.toChain)
  const unwrap = $derived(bridgeSettings.unwrap)

  // const showToolbox = (type: string) => {
  //   ontoggle(type)
  // }
  // lock toggles
  // let costLimitLocked = $state(false)
  // let deliveryFeeLocked = $state(false)
  const fontSizeInput = 'calc(0.875rem* var(--text-scaling))'
  const deliveryFeeLocked = $derived(storageBridgeSettings.value?.deliveryFeeLocked ?? false)
  const costLimitLocked = $derived(storageBridgeSettings.value?.costLimitLocked ?? false)
  const feeType = $derived(storageBridgeSettings.value?.feeType ?? input.FeeType.PERCENT)
  storageBridgeSettings.extend({
    deliveryFeeLocked: false,
    costLimitLocked: false,
  })
  const reasonableFixedFee = $derived(bridgeSettings.reasonableFixedFee)
  const reasonablePercentOnTopOfGasFee = $derived(bridgeSettings.reasonablePercentOnTopOfGasFee)
  const reasonablePercentFee = $derived(bridgeSettings.reasonablePercentFee)
  $effect.pre(() => {
    if (feeType === input.FeeType.GAS_TIP && !deliveryFeeLocked) {
      input.gasTipFee.value = reasonablePercentOnTopOfGasFee
    } else if (feeType === input.FeeType.FIXED && !deliveryFeeLocked) {
      input.fixedFee.value = reasonableFixedFee
    } else if (feeType === input.FeeType.PERCENT && !deliveryFeeLocked) {
      input.percentFee.value = reasonablePercentFee
    }
  })
  $effect.pre(() => {
    if (feeType === input.FeeType.GAS_TIP && !costLimitLocked) {
      input.limit.value = bridgeSettings.reasonablePercentOnGasLimit
    }
  })
  const feeTypeOptions = [
    { key: input.FeeType.FIXED, text: 'Fixed' },
    { key: input.FeeType.GAS_TIP, text: '⛽+%' },
    { key: input.FeeType.PERCENT, text: '%' },
  ]
  const decimals = $derived(asset?.decimals || 18)
  const large = $derived(!!innerWidth.current && innerWidth.current >= 512)
  const fromChainId = $derived(input.bridgeKey.fromChain)

  const bridgeFeeDecimals = $derived(humanReadableNumber((bridgeSettings.bridgeFee ?? 0n) * 100n))
  const costFromInputs = $derived(bridgeSettings.availableCompensationMaximum ?? 0n)
  const fontSizeClass = 'text-(length:--text-scaling)'
  const etherBasedGasTipFee = $derived(
    humanReadableNumber(input.gasTipFee.value ?? 0n, {
      decimals: 16,
    }),
  )
  const etherBasedGasTipFeeLength = $derived(etherBasedGasTipFee.length ?? 0)
  // const networkCostTooltip = $derived(
  //   `\ncurrently: ${humanReadableNumber(bridgeSettings.estimatedTokenNetworkCost ?? 0n, {
  //     decimals: asset?.decimals || 18,
  //   })} ${utils.nativeSymbol(asset, unwrap)}`,
  // )
</script>

<Section id="bridge-advanced-mode" focused>
  <div class="text-surface-contrast-50 w-full text-xs sm:text-sm">
    <div class="flex flex-row items-center leading-8 justify-between w-full text-sm">
      <span>Bridge Fee</span>
      <Tooltip tooltip="The fee set by the bridge" placement="left">
        <span class="flex flex-row items-center align-baseline gap-1"
          ><Loading key="bridge-fee">
            {#snippet contents()}{bridgeFeeDecimals}{/snippet}
          </Loading>%</span>
      </Tooltip>
    </div>
    <!-- from home chain -->
    {#if fromChainId === Chains.PLS || fromChainId === Chains.V4PLS}
      <div class="relative hover:z-10 leading-8">
        <div class="flex flex-row leading-8 justify-between items-center text-sm">
          <span class="flex items-center flex-row gap-2">
            <ButtonToggle
              contentClass="leading-6 my-1"
              title={large ? 'Delivery' : 'Deliv.'}
              checked={shouldDeliver.value}
              onclick={() => {
                shouldDeliver.value = !shouldDeliver.value
              }}
              >{#if large}Delivery{:else}Deliv.{/if}</ButtonToggle>
            <!-- <Button
              title="toggle delivery"
              class="border-r-2 pr-2 leading-6 transition duration-100 rounded-2xl {shouldDeliver.value
                ? 'border-surface-500'
                : 'border-surface-300'}"
              onclick={() => {
                shouldDeliver.value = !shouldDeliver.value
              }}
              >{#if large}Delivery{:else}Deliv.{/if}</Button> -->
            <FeeTypeToggle
              active={feeType}
              options={feeTypeOptions}
              onchange={(e) => {
                const feeType = e.key as input.FeeType
                storageBridgeSettings.extend({
                  feeType,
                  deliveryFeeLocked: false,
                  costLimitLocked: false,
                })
                if (e.key === input.FeeType.PERCENT) {
                  input.percentFee.value = bridgeSettings.reasonablePercentFee
                } else if (feeType === input.FeeType.GAS_TIP) {
                  // console.log(
                  //   'gas tip',
                  //   formatUnits(bridgeSettings.reasonablePercentOnTopOfGasFee, 18),
                  // )
                  input.gasTipFee.value = bridgeSettings.reasonablePercentOnTopOfGasFee
                } else if (feeType === input.FeeType.FIXED) {
                  input.fixedFee.value = bridgeSettings.reasonableFixedFee
                }
              }} />{#if feeType === input.FeeType.PERCENT || feeType === input.FeeType.GAS_TIP}<Button
                class="flex px-1 leading-6"
                onclick={() => {
                  storageBridgeSettings.extend({
                    deliveryFeeLocked: !deliveryFeeLocked,
                  })
                }}><LockIcon locked={deliveryFeeLocked} /></Button
              >{/if}
          </span>
          {#if shouldDeliver.value}
            <Tooltip
              class="grow flex flex-row items-center"
              triggerClassName="grow flex flex-row items-center justify-end"
              placement="top"
              tooltip={feeType === input.FeeType.FIXED
                ? 'Fee uses fixed value defined in cost limit'
                : feeType === input.FeeType.GAS_TIP
                  ? `Percentage of gas used * ${input.bridgeKey.destinationSupportsEIP1559 ? 'base fee' : 'gas price'} to allocate to the router for performing this action`
                  : `The percentage of bridged tokens to use as delivery fee after the bridge fee`}>
              <!-- <Button
                title="fee-amount"
                class="flex flex-row strike tooltip tooltip-top tooltip-left-toward-center items-center relative text-sm {feeType ===
                input.FeeType.FIXED
                  ? 'line-through'
                  : ''}"
                onclick={focusOnInputChild}> -->
              {#if feeType === input.FeeType.FIXED}
                <!-- <span class="flex items-end self-end">0.0%</span> -->
              {:else if feeType === input.FeeType.GAS_TIP}
                <span class="grow flex flex-row w-full items-center justify-end">⛽&nbsp;+</span>
                <span
                  class="flex flex-row grow leading-8 h-8 min-w-8 text-inherit text-sm items-center justify-end w-fit max-w-24"
                  style:width={`${etherBasedGasTipFeeLength}em`}>
                  <NumericInput
                    sizeClass="flex items-center h-full w-full"
                    fontSizeInput={null}
                    {fontSizeClass}
                    value={input.gasTipFee.value}
                    decimals={16}
                    oninput={(e) => {
                      storageBridgeSettings.extend({
                        deliveryFeeLocked: true,
                      })
                      if (e > oneEther * 10n) {
                        e = oneEther * 10n
                      }
                      input.gasTipFee.value = e
                      return e
                    }} /></span>
                <span class="flex-none flex flex-row items-center">%</span>
              {:else if feeType === input.FeeType.PERCENT}
                <NumericInput
                  sizeClass="flex flex-row w-auto grow leading-8 h-8 text-inherit text-sm"
                  fontSizeInput={null}
                  {fontSizeClass}
                  value={input.percentFee.value ?? 0n}
                  decimals={16}
                  oninput={(e) => {
                    storageBridgeSettings.extend({
                      deliveryFeeLocked: true,
                    })
                    const max = oneEther / 10n
                    if (feeType === input.FeeType.PERCENT) {
                      if (e > max) {
                        e = max
                      }
                    }
                    input.percentFee.value = e
                    return e
                  }} />
                <span class="text-sm flex items-center">%</span>
              {/if}
            </Tooltip>
          {:else}
            <span class="flex items-end self-end">0.0%</span>
          {/if}
        </div>
        <UndercompensatedWarning />
      </div>
      <div class="flex flex-row leading-8 justify-between items-center h-8">
        <Tooltip
          placement="top"
          tooltip={"Allows cost limit to float with the destination chain's base fee. While unlocked the number in the ui may change. Once a transaction is sent, the number in that transaction's calldata is fixed"}>
          <button
            type="button"
            name="toggle-cost-limit"
            class="tooltip tooltip-top tooltip-right-toward-center relative text-sm leading-5"
            onclick={() => {
              storageBridgeSettings.extend({
                costLimitLocked: !costLimitLocked,
              })
            }}>
            Cost&nbsp;{#if feeType === input.FeeType.GAS_TIP}Limit&nbsp;<LockIcon
                locked={costLimitLocked} />{/if}
          </button>
        </Tooltip>
        {#if shouldDeliver.value}
          <Tooltip
            class="grow justify-end w-full"
            triggerClassName="grow justify-end w-full"
            placement="top"
            tooltip={feeType === input.FeeType.FIXED || feeType === input.FeeType.PERCENT
              ? 'The fixed fee to tip to an address to perform the work'
              : 'The max you are willing to tip to the router address'}>
            <span
              class="flex items-center text-sm leading-5 grow w-full justify-end"
              class:opacity-60={!loading.isResolved('gas')}>
              {#if feeType === input.FeeType.PERCENT}
                <span
                  >{humanReadableNumber(costFromInputs ?? 0n, {
                    decimals: asset?.decimals ?? 18,
                  })}
                  {utils.nativeSymbol(asset, unwrap)}</span>
              {:else if feeType === input.FeeType.GAS_TIP}
                <!-- put gas tip estimates here -->
                <NumericInput
                  value={input.limit.value}
                  {decimals}
                  {fontSizeClass}
                  fontSizeInput={null}
                  sizeClass="w-full leading-8 h-8 grow"
                  oninput={(e) => {
                    storageBridgeSettings.extend({
                      costLimitLocked: true,
                    })
                    input.limit.value = e
                  }} />
              {:else if feeType === input.FeeType.FIXED}
                <NumericInput
                  value={input.fixedFee.value}
                  {decimals}
                  {fontSizeClass}
                  fontSizeInput={null}
                  sizeClass="w-full leading-8 h-8 grow"
                  oninput={(e) => {
                    storageBridgeSettings.extend({
                      costLimitLocked: true,
                    })
                    input.limit.value = e
                  }} />&nbsp;{utils.nativeSymbol(asset, unwrap)}
              {/if}
            </span>
          </Tooltip>
        {:else}
          <span class="flex text-sm">
            <span>0.0&nbsp;{utils.nativeSymbol(asset, unwrap)}</span>
          </span>
        {/if}
      </div>
    {/if}
    <!-- <div class="flex flex-row leading-8 justify-between">
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
    </div> -->
    <!-- settings below -->
    <div class="mt-1">
      <Settings />
    </div>
  </div>
</Section>

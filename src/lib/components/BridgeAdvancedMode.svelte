<script lang="ts">
  import { untrack } from 'svelte'
  import Button from './Button.svelte'
  import Section from './Section.svelte'
  import NumericInput from './NumericInput.svelte'
  import * as input from '$lib/stores/input.svelte'
  import { formatUnits, parseEther, parseUnits } from 'viem'
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
  let costLimitLocked = $state(false)
  let deliveryFeeLocked = $state(false)
  const feeType = $derived(storageBridgeSettings.value?.feeType ?? input.FeeType.PERCENT)
  $effect.pre(() => {
    // const amountIn = input.amountIn.value
    // console.log(amountIn)
    if (costLimitLocked) return
    if (feeType === input.FeeType.GAS_TIP) {
      input.gasTipFee.value = bridgeSettings.reasonablePercentOnTopOfGasFee
    } else if (feeType === input.FeeType.FIXED) {
      input.fixedFee.value = bridgeSettings.reasonableFixedFee
    } else if (feeType === input.FeeType.PERCENT) {
      input.percentFee.value = bridgeSettings.reasonablePercentFee
    }
  })
  // fee math constants
  // const scaledBasisPoint = parseEther('0.01')
  // const max = parseEther('10')
  // const min = parseEther('0.05')
  // const percentFeeFromNetworkInputs = () => {
  //   const amountAfterBridgeFee = untrack(() => bridgeSettings.amountAfterBridgeFee)
  //   const estimatedNetworkCost = untrack(() => bridgeSettings.estimatedNetworkCost)
  //   if (!amountAfterBridgeFee || !estimatedNetworkCost) {
  //     return 0n
  //   }
  //   const ratioOffset = (estimatedNetworkCost * 25_000n) / amountAfterBridgeFee
  //   let target = min + scaledBasisPoint * ratioOffset
  //   if (target > max) {
  //     target = max
  //   } else if (target < min) {
  //     target = min
  //   }
  //   return target
  // }
  // const gasPercentFeeFromNetworkInputs = () => {
  //   const priceCorrective = untrack(() => bridgeSettings.priceCorrective.value)
  //   const asset = untrack(() => bridgeSettings.assetIn.value)
  //   const latestBaseFeePerGas = untrack(() => bridgeSettings.latestBaseFeePerGas)
  //   const fee = untrack(() => input.fee.value)
  //   const amountAfterBridgeFee = untrack(() => bridgeSettings.amountAfterBridgeFee)
  //   if (priceCorrective === 0n || !asset) {
  //     return
  //   }
  //   const numDecimals = 6n
  //   const lowResLimit =
  //     (latestBaseFeePerGas * (fee + oneEther)) / (10n ** (11n - numDecimals) * 10n * oneEther)
  //   let lim = lowResLimit * 10n ** (18n - numDecimals)
  //   lim = (lim * oneEther) / priceCorrective / (oneEther / 10n ** BigInt(asset!.decimals))
  //   if (lim > amountAfterBridgeFee) {
  //     lim = amountAfterBridgeFee
  //   }
  //   return lim
  // }
  // const reflowFees = () => {
  //   const fee = untrack(() => input.fee.value)
  //   const feeType = untrack(() => input.feeType)
  //   const desiredExcessCompensationPercentage = untrack(
  //     () => bridgeSettings.desiredExcessCompensationPercentage,
  //   )
  //   const amountAfterBridgeFee = untrack(() => bridgeSettings.amountAfterBridgeFee)
  //   if (!bridgeSettings.bridgePathway?.requiresDelivery) {
  //     input.fee.value = 0n
  //     return
  //   }
  //   if (feeType === input.FeeType.PERCENT) {
  //     if (!deliveryFeeLocked) {
  //       input.fee.value = percentFeeFromNetworkInputs() || desiredExcessCompensationPercentage
  //     }
  //   }
  //   if (feeType === input.FeeType.GAS_TIP || feeType === input.FeeType.FIXED) {
  //     if (!costLimitLocked) {
  //       const floatingLimit = gasPercentFeeFromNetworkInputs()
  //       if (floatingLimit) {
  //         input.limit.value = floatingLimit
  //       }
  //     }
  //   } else if (asset) {
  //     const limit = untrack(() => (amountAfterBridgeFee * fee) / oneEther)
  //     input.limit.value = limit
  //   }
  // }
  const feeTypeOptions = [
    { key: input.FeeType.FIXED, text: 'Fixed' },
    { key: input.FeeType.GAS_TIP, text: '⛽+%' },
    { key: input.FeeType.PERCENT, text: '%' },
  ]
  // $effect(() => {
  //   if (asset && feeType === input.FeeType.GAS_TIP) {
  //     const limit = gasPercentFeeFromNetworkInputs() || 10n * oneEther
  //     if (untrack(() => input.limit.value) !== limit) {
  //       input.limit.value = limit
  //     }
  //   }
  // })
  // $effect(() => {
  //   if (
  //     (deliveryFeeLocked || !deliveryFeeLocked) &&
  //     (costLimitLocked || !costLimitLocked) &&
  //     (bridgeSettings.amountToBridge || !bridgeSettings.amountToBridge) &&
  //     (bridgeSettings.fee || !bridgeSettings.fee) &&
  //     feeType &&
  //     bridgeSettings.assetInAddress
  //   ) {
  //     reflowFees()
  //   }
  // })
  const focusOnInputChild: EventHandler = (e) => {
    e.currentTarget.querySelector('input')?.focus()
  }
  const decimals = $derived(asset?.decimals || 18)
  const large = $derived(!!innerWidth.current && innerWidth.current >= 512)
  const fromChainId = $derived(input.bridgeKey.fromChain)
  const out = $derived({
    ...asset,
    logoURI: assetSources(asset, [`${fromChainId}/${bridgeSettings.assetInAddress}`]),
  } as Token)

  // 1) bridge fee line
  const bridgeFeeDecimals = $derived(humanReadableNumber(bridgeSettings.bridgeFee * 100n))
  // 2) delivery input line
  // let deliveryFeePercentInt = $state(input.fee.value ?? 0n)
  // 3) cost limit line
  // const cost = $derived(feeType === input.FeeType.FIXED ? bridgeSettings.reasonableFixedFee : feeType === input.FeeType.PERCENT? bridgeSettings.reasonableFixedFee)
  const recommendedCost = $derived.by(() => {
    if (feeType === input.FeeType.FIXED) {
      return bridgeSettings.reasonableFixedFee
    }
    //  else if (feeType === input.FeeType.PERCENT) {
    //   return bridgeSettings.reasonablePercentFee
    // } else if (feeType === input.FeeType.GAS_TIP) {
    //   return bridgeSettings.reasonablePercentOnTopOfGasFee
    // }
    return null
  })
  // $inspect('cost', cost)
  const expectedAmountOut = $derived(
    bridgeSettings.amountToBridge &&
      recommendedCost &&
      humanReadableNumber(
        bridgeSettings.amountAfterBridgeFee - recommendedCost > 0n
          ? bridgeSettings.amountAfterBridgeFee - recommendedCost
          : 0n,
        {
          decimals,
          decimalCount: null,
          truncLen: true,
        },
      ),
  )
  const cost = $derived(recommendedCost)
  const gasIsLoading = $derived(!loading.resolved)
  // const cost = $derived((bridgeSettings.amountAfterBridgeFee * bridgeSettings.fee) / oneEther)
</script>

<Section id="bridge-advanced-mode" focused>
  <div class="text-surface-contrast-50 w-full">
    <div class="flex flex-row items-center leading-8 justify-between w-full text-sm">
      <span>Bridge Fee</span>
      <Tooltip tooltip="Fee set on the bridge" placement="left">
        <span class="flex flex-row items-center align-baseline gap-1"
          ><Loading key="bridge-fee">
            {#snippet contents()}{bridgeFeeDecimals}{/snippet}
          </Loading>%</span>
      </Tooltip>
    </div>
    <!-- from home chain -->
    {#if fromChainId === Chains.PLS || fromChainId === Chains.V4PLS}
      <div class="relative hover:z-10">
        <div class="flex flex-row leading-8 justify-between items-center text-sm">
          <span class="flex items-center flex-row gap-2">
            <span
              >{#if large}Delivery{:else}Deliv.{/if}</span
            ><SlideToggle
              checked={shouldDeliver.value}
              onchange={({ checked }) => {
                shouldDeliver.value = checked
              }} />
            <FeeTypeToggle
              active={feeType}
              options={feeTypeOptions}
              onchange={(e) => {
                // storageBridgeSettings.feeType = e.key as input.FeeType
                storageBridgeSettings.extend({ feeType: e.key as input.FeeType })
                if (e.key === input.FeeType.PERCENT) {
                  input.percentFee.value = bridgeSettings.reasonablePercentFee
                } else if (feeType === input.FeeType.GAS_TIP) {
                  // input.gasTipFee.value = bridgeSettings.desiredExcessCompensationBasisPoints
                  input.gasTipFee.value = bridgeSettings.reasonablePercentOnTopOfGasFee
                } else if (feeType === input.FeeType.FIXED) {
                  // input.fixedFee.value = bridgeSettings.desiredExcessCompensationBasisPoints
                  input.fixedFee.value = bridgeSettings.reasonableFixedFee
                }
              }} />{#if feeType === input.FeeType.PERCENT}<button
                type="button"
                name="toggle-delivery-fee"
                class="flex px-1 leading-6"
                onclick={() => {
                  deliveryFeeLocked = !deliveryFeeLocked
                }}><LockIcon locked={deliveryFeeLocked} /></button
              >{/if}
          </span>
          {#if shouldDeliver.value}
            <Tooltip
              placement="top"
              tooltip={feeType === input.FeeType.FIXED
                ? 'Fee uses fixed value defined in cost limit'
                : feeType === input.FeeType.GAS_TIP
                  ? `Percentage of gas used * ${input.bridgeKey.destinationSupportsEIP1559 ? 'base fee' : 'gas price'} to allocate to the transaction runner for performing this action\ncurrently: ${humanReadableNumber(
                      bridgeSettings.estimatedTokenNetworkCost ?? 0n,
                      {
                        decimals: asset?.decimals || 18,
                      },
                    )} ${utils.nativeSymbol(asset, unwrap)}`
                  : 'The percentage of bridged tokens after the bridge fee'}>
              <Button
                title="fee-amount"
                class="flex flex-row strike tooltip tooltip-top tooltip-left-toward-center items-center relative text-sm {feeType ===
                input.FeeType.FIXED
                  ? 'line-through'
                  : ''}"
                onclick={focusOnInputChild}>
                {#if feeType === input.FeeType.FIXED}
                  <span class="flex items-end self-end">0.0%</span>
                {:else if feeType === input.FeeType.GAS_TIP}
                  <NumericInput
                    sizeClass="flex flex-row w-auto shrink-1 leading-8 h-8 text-inherit text-sm"
                    fontSizeInput={null}
                    value={input.gasTipFee.value}
                    decimals={18}
                    oninput={(e) => {
                      deliveryFeeLocked = true
                      const max = oneEther
                      if (e > max) {
                        e = max
                      }
                      input.gasTipFee.value = e
                    }} />
                {:else if feeType === input.FeeType.PERCENT}
                  <NumericInput
                    sizeClass="flex flex-row w-auto shrink-1 leading-8 h-8 text-inherit text-sm"
                    fontSizeInput={null}
                    value={input.percentFee.value ?? 0n}
                    decimals={18 - 2}
                    oninput={(e) => {
                      deliveryFeeLocked = true
                      const max = oneEther / 10n
                      if (feeType === input.FeeType.PERCENT) {
                        if (e > max) {
                          e = max
                        }
                      }
                      input.percentFee.value = e
                      return e
                    }} />
                  <span class="text-sm">%</span>
                {/if}
                <!-- {#if feeType === input.FeeType.PERCENT || feeType === input.FeeType.GAS_TIP}
                  {@const decimals = bridgeSettings.assetIn.value?.decimals || 18}
                  <span class:hidden={feeType !== input.FeeType.GAS_TIP}>⛽&nbsp;+</span>
                  <span class="flex items-center" class:opacity-60={gasIsLoading}>
                    <NumericInput
                      sizeClass="flex flex-row w-auto shrink-1 leading-8 h-8 text-inherit text-sm"
                      fontSizeInput={null}
                      value={deliveryFeePercentInt}
                      decimals={16}
                      oninput={(e) => {
                        deliveryFeeLocked = true
                        const max = oneEther / 10n
                        if (feeType === input.FeeType.PERCENT) {
                          if (e > max) {
                            e = max
                          }
                        }
                        input.fee.value = e
                        deliveryFeePercentInt = e
                        return e
                      }} />
                    {#if feeType === input.FeeType.PERCENT}
                      <span class="text-sm">%</span>
                    {/if}
                  </span>
                {/if} -->
              </Button>
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
              costLimitLocked = !costLimitLocked
            }}>
            Cost&nbsp;{#if feeType === input.FeeType.GAS_TIP || feeType === input.FeeType.FIXED}Limit&nbsp;<LockIcon
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
              : 'The max you are willing to tip to the address'}>
            <span
              class="flex items-center text-sm leading-5 grow w-full"
              class:opacity-60={gasIsLoading}>
              {#if feeType === input.FeeType.PERCENT}
                <span
                  >{humanReadableNumber(cost ?? 0n, {
                    decimals: asset?.decimals ?? 18,
                  })}
                  {utils.nativeSymbol(asset, unwrap)}</span>
              {:else if feeType === input.FeeType.GAS_TIP}{:else if feeType === input.FeeType.FIXED}
                <NumericInput
                  value={input.fixedFee.value}
                  {decimals}
                  fontSizeInput={16}
                  sizeClass="w-full leading-8 h-8 grow"
                  oninput={(e) => {
                    costLimitLocked = true
                    input.limit.value = e
                  }} />{utils.nativeSymbol(asset, unwrap)}
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
  </div>
</Section>

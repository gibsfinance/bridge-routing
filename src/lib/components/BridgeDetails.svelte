<script lang="ts">
  import { innerWidth } from 'svelte/reactivity/window'

  import * as input from '../stores/input.svelte'
  import { humanReadableNumber } from '../stores/utils'
  import { loading } from '../stores/loading.svelte'
  import { bridgeSettings, oneEther } from '../stores/bridge-settings.svelte'
  import { Chains } from '../stores/auth/types'
  import * as utils from '../utils.svelte'
  import type { Token } from '../types.svelte'
  import { bridgeSettings as storageBridgeSettings } from '../stores/storage.svelte'

  import Loading from './Loading.svelte'
  import LockIcon from './LockIcon.svelte'
  import UndercompensatedWarning from './warnings/Undercompensated.svelte'
  import FeeTypeToggle from './FeeTypeToggle.svelte'
  import Button from './Button.svelte'
  import Section from './Section.svelte'
  import NumericInput from './NumericInput.svelte'
  import Tooltip from './Tooltip.svelte'
  import Settings from './Settings.svelte'
  import ButtonToggle from './ButtonToggle.svelte'

  type Props = {
    asset: Token | null
  }
  const { shouldDeliver } = input
  const { asset = null }: Props = $props()
  const unwrap = $derived(bridgeSettings.unwrap)

  const deliveryFeeLocked = $derived(storageBridgeSettings.value?.deliveryFeeLocked ?? false)
  const costLimitLocked = $derived(storageBridgeSettings.value?.costLimitLocked ?? false)
  const feeType = $derived(storageBridgeSettings.value?.feeType ?? input.FeeType.PERCENT)
  storageBridgeSettings.extend({
    deliveryFeeLocked: false,
    costLimitLocked: false,
  })
  const feeTypeOptions = [
    {
      key: input.FeeType.FIXED,
      text: 'Fixed',
      tooltip: 'Name a fixed fee to tip',
    },
    {
      key: input.FeeType.GAS_TIP,
      text: '⛽+%',
      tooltip: 'Allow the tip to float with the destination chain\'s base fee',
    },
    {
      key: input.FeeType.PERCENT,
      text: '%',
      tooltip: 'Name a fee in percentage terms to tip',
    },
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
</script>

<Section id="bridge-details" focused>
  <div class="text-surface-contrast-50 w-full text-xs sm:text-sm">
    <div class="flex flex-row items-center leading-7 justify-between w-full text-sm">
      <span>Bridge Fee</span>
      <Tooltip placement="top">
        {#snippet trigger()}
          <span class="flex flex-row items-center align-baseline gap-1"
            ><Loading key="bridge-fee">
              {#snippet contents()}{bridgeFeeDecimals}{/snippet}
            </Loading>%</span>
        {/snippet}
        {#snippet content()}The fee set by the bridge{/snippet}
      </Tooltip>
    </div>
    <!-- from home chain -->
    {#if fromChainId === Chains.PLS || fromChainId === Chains.V4PLS}
      <div class="relative hover:z-10 leading-7">
        <div class="flex flex-row leading-7 justify-between items-center text-sm">
          <span class="flex items-center flex-row gap-1">
            <ButtonToggle
              contentClass="leading-6 my-0.5"
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
                  input.gasTipFee.value = bridgeSettings.reasonablePercentOnTopOfGasFee
                } else if (feeType === input.FeeType.FIXED) {
                  input.fixedFee.value = bridgeSettings.reasonableFixedFee
                }
              }} />
            {#if feeType === input.FeeType.GAS_TIP || feeType === input.FeeType.PERCENT}
              <Button
                class="flex px-1 leading-6"
                onclick={() => {
                  storageBridgeSettings.extend({
                    deliveryFeeLocked: !deliveryFeeLocked,
                  })
                }}><LockIcon locked={deliveryFeeLocked} />
              </Button>
            {/if}
          </span>
          {#if shouldDeliver.value}
            <Tooltip
              class="grow flex flex-row items-center"
              triggerClasses="grow flex flex-row items-center justify-end text-sm leading-7"
              placement="top">
              {#snippet trigger()}
                {#if feeType === input.FeeType.FIXED}
                  <!-- <span class="flex items-end self-end">0.0%</span> -->
                {:else if feeType === input.FeeType.GAS_TIP}
                  <span class="grow flex flex-row w-full items-center justify-end">⛽&nbsp;+</span>
                  <span
                    class="flex flex-row grow leading-7 h-7 min-w-8 text-inherit text-sm items-center justify-end w-fit max-w-24"
                    style:width={`${etherBasedGasTipFeeLength}em`}>
                    <NumericInput
                      sizeClass="flex items-center h-full w-full"
                      fontSizeInput={null}
                      {fontSizeClass}
                      value={input.gasTipFee.value}
                      decimals={16}
                      oninput={({ int }) => {
                        storageBridgeSettings.extend({
                          deliveryFeeLocked: true,
                        })
                        if (int !== null) {
                          if (int > oneEther * 10n) {
                            int = oneEther * 10n
                          }
                          input.gasTipFee.value = int
                          return int
                        }
                      }} /></span>
                  <span class="flex-none flex flex-row items-center leading-8">%</span>
                {:else if feeType === input.FeeType.PERCENT}
                  <NumericInput
                    sizeClass="flex flex-row w-auto grow leading-7 h-7 text-inherit text-sm"
                    fontSizeInput={null}
                    {fontSizeClass}
                    value={input.percentFee.value ?? 0n}
                    decimals={16}
                    oninput={({ int: e }) => {
                      storageBridgeSettings.extend({
                        deliveryFeeLocked: true,
                      })
                      const max = oneEther / 10n
                      if (e !== null) {
                        if (feeType === input.FeeType.PERCENT) {
                          if (e > max) {
                            e = max
                          }
                        }
                        input.percentFee.value = e
                        return e
                      }
                    }} />
                  <span class="text-sm flex items-center">%</span>
                {/if}
              {/snippet}
              {#snippet content()}
                {feeType === input.FeeType.FIXED
                  ? 'Fee uses fixed value defined in cost limit'
                  : feeType === input.FeeType.GAS_TIP
                    ? `Percentage of gas used * ${input.bridgeKey.destinationSupportsEIP1559 ? 'base fee' : 'gas price'} to allocate to the router for performing this action`
                    : `The percentage of bridged tokens to use as delivery fee after the bridge fee`}
              {/snippet}
            </Tooltip>
          {:else}
            <span class="flex items-end self-end leading-8">0.0%</span>
          {/if}
        </div>
        <UndercompensatedWarning />
      </div>
      <div class="flex flex-row leading-7 justify-between items-center h-7">
        <Tooltip placement="top">
          {#snippet content()}Allows cost limit to float with the destination chain's base fee.
            While unlocked the number in the ui may change. Once a transaction is sent, the number
            in that transaction's calldata is fixed{/snippet}
          {#snippet trigger()}
            <Button
              name="toggle-cost-limit"
              class="tooltip tooltip-top tooltip-right-toward-center relative text-sm leading-7 flex flex-row items-center gap-1"
              onclick={() => {
                storageBridgeSettings.extend({
                  costLimitLocked: !costLimitLocked,
                })
              }}>
              <span>Cost&nbsp;{#if feeType === input.FeeType.GAS_TIP}Limit&nbsp;{/if}</span>
              {#if feeType === input.FeeType.FIXED || feeType === input.FeeType.GAS_TIP}
              <LockIcon locked={costLimitLocked} />
              {/if}
            </Button>
          {/snippet}
        </Tooltip>
        {#if shouldDeliver.value}
          <Tooltip
            class="grow justify-end w-full"
            triggerClasses="grow justify-end w-full"
            placement="top">
            {#snippet content()}
              {feeType === input.FeeType.FIXED || feeType === input.FeeType.PERCENT
                ? 'The fixed fee to tip to an address to perform the work'
                : 'The max you are willing to tip to the router address'}
            {/snippet}
            {#snippet trigger()}
              <span
                class="flex items-center text-sm leading-7 grow w-full justify-end"
                class:opacity-75={!loading.isResolved('gas')}>
                {#if feeType === input.FeeType.PERCENT}
                  <span
                    >{humanReadableNumber(costFromInputs ?? 0n, {
                      decimals: asset?.decimals ?? 18,
                    })}
                    {asset?.symbol}</span>
                {:else if feeType === input.FeeType.GAS_TIP}
                  <!-- put gas tip estimates here -->
                  <NumericInput
                    value={input.limit.value}
                    {decimals}
                    {fontSizeClass}
                    fontSizeInput={null}
                    sizeClass="w-full leading-7 h-7 grow"
                    oninput={({ int }) => {
                      storageBridgeSettings.extend({
                        costLimitLocked: true,
                      })
                      input.limit.value = int
                      if (int !== null) {
                        return int
                      }
                    }} />
                {:else if feeType === input.FeeType.FIXED}
                  <NumericInput
                    value={input.fixedFee.value}
                    {decimals}
                    {fontSizeClass}
                    fontSizeInput={null}
                    sizeClass="w-full leading-7 h-7 grow"
                    oninput={({ int }) => {
                      storageBridgeSettings.extend({
                        costLimitLocked: true,
                      })
                      if (int !== null) {
                        input.limit.value = int
                        return int
                      }
                    }} />&nbsp;{asset?.symbol}
                {/if}
              </span>
            {/snippet}
          </Tooltip>
        {:else}
          <span class="flex text-sm leading-8">
            <span>0.0&nbsp;{utils.nativeSymbol(asset, unwrap)}</span>
          </span>
        {/if}
      </div>
    {/if}
    <Settings />
  </div>
</Section>

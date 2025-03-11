<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import _ from 'lodash'
  import NumericInput from './NumericInput.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import SelectButtonContents from './SelectButtonContents.svelte'
  import type { Snippet } from 'svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import BalanceReadout from './BalanceReadout.svelte'
  import { largeInputFontScaler } from '$lib/stores/font-scaler'
  import OnboardRadio from './OnboardRadio.svelte'
  import { humanReadableNumber } from '$lib/stores/utils'

  type Props = {
    id?: string
    label?: string
    token: Token
    showRadio?: boolean
    disabled?: boolean
    disabledInput?: boolean
    readonlyInput?: boolean
    readonlyTokenSelect?: boolean
    focused?: boolean
    oninput?: (v: bigint) => void
    value: bigint | null
    modal?: Snippet<[{ close: () => void }]>
    underinput?: Snippet
    onmax?: (v: bigint) => void
    onbalanceupdate?: (v: bigint | null) => void
  }
  const {
    id = _.uniqueId('section-input-'),
    token,
    label,
    oninput,
    showRadio = false,
    readonlyInput = false,
    readonlyTokenSelect = false,
    disabled = false,
    focused = false,
    disabledInput = false,
    value,
    modal,
    underinput,
    onmax,
    onbalanceupdate,
  }: Props = $props()
</script>

<label
  for={id}
  class="flex flex-col items-center justify-items-end grow gap-1 rounded-container shadow-inset justify-between w-full preset-outline-surface-500 overflow-hidden relative p-4"
  class:bg-white={focused}
  class:bg-surface-950-50={!focused}
  class:cursor-not-allowed={readonlyInput && readonlyTokenSelect}>
  <div class="flex relative items-center flex-col w-full gap-2">
    <div class="flex flex-row justify-between w-full h-5">
      <span class="text-sm text-gray-500">{label}</span>
      {#if showRadio}
        <OnboardRadio />
      {/if}
    </div>
    <div class="flex flex-row items-center justify-between w-full">
      {#if readonlyInput}
        {@const valIsNumber = typeof value === 'bigint'}
        {@const humanReadable =
          valIsNumber && value !== 0n
            ? humanReadableNumber(value, {
                decimals: token.decimals,
              })
            : value?.toString()}
        <span
          class="w-full input py-0 px-0 ring-0 focus:ring-0 text-surface-contrast-50 placeholder:text-gray-500 h-10 leading-10"
          style:font-size={`${largeInputFontScaler(humanReadable?.length ?? 0)}px`}
          >{valIsNumber ? humanReadable : '0'}</span>
      {:else}
        <NumericInput
          {id}
          class="w-full input py-0 px-0 ring-0 focus:ring-0 text-surface-contrast-50 placeholder:text-gray-500 h-10 leading-10 tracking-tight"
          {value}
          decimals={token.decimals}
          {disabled}
          {oninput} />
      {/if}
      {#if readonlyTokenSelect}
        <SelectButtonContents {token} network={token.chainId} hideChevron />
      {:else}
        <ModalWrapper
          wrapperClasses="flex items-center justify-center h-full"
          triggerClasses=""
          contentClasses="">
          {#snippet button()}
            <SelectButtonContents {token} network={token.chainId} />
          {/snippet}
          {#snippet contents({ close })}
            {@render modal?.({ close })}
          {/snippet}
        </ModalWrapper>
      {/if}
    </div>

    <div class="flex gap-1 flex-row-reverse justify-between grow w-full h-5">
      {#if accountState.address && (!!onmax || !!onbalanceupdate)}
        <BalanceReadout
          {token}
          account={accountState.address}
          showLoader
          roundedClasses={null}
          hideSymbol
          decimalLimit={9}
          {onbalanceupdate}
          {onmax} />
      {/if}
      {@render underinput?.()}
    </div>
  </div>
</label>

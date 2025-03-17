<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import _ from 'lodash'
  import NumericInput from './NumericInput.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import SelectButtonContents from './SelectButtonContents.svelte'
  import type { Snippet } from 'svelte'
  import Section from './Section.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import BalanceReadout from './BalanceReadout.svelte'
  import { largeInputFontScaler } from '$lib/stores/font-scaler'
  import { humanReadableNumber } from '$lib/stores/utils'

  type Props = {
    id?: string
    label?: string
    token: Token | null
    showRadio?: boolean
    disabled?: boolean
    readonlyInput?: boolean
    readonlyTokenSelect?: boolean
    focused?: boolean
    oninput?: (v: bigint) => void
    value: bigint | null
    modal?: Snippet<[{ close: () => void }]>
    radio?: Snippet
    underinput?: Snippet
    onmax?: (v: bigint) => void
    onbalanceupdate?: (v: bigint | null) => void
  }
  const {
    id = _.uniqueId('section-input-'),
    token,
    label,
    oninput,
    readonlyInput = false,
    readonlyTokenSelect = false,
    disabled = false,
    focused = false,
    value,
    radio,
    modal,
    underinput,
    onmax,
    onbalanceupdate,
  }: Props = $props()
  const sectionDisabled = $derived(readonlyInput && readonlyTokenSelect)
</script>

<Section {id} {focused} disabled={sectionDisabled}>
  <div class="flex flex-row justify-between w-full h-5">
    <span class="text-sm text-gray-500">{label}</span>
    {@render radio?.()}
  </div>
  <div class="flex flex-row items-center justify-between w-full">
    {#if readonlyInput}
      {@const valIsNumber = typeof value === 'bigint'}
      {@const humanReadable =
        valIsNumber && value !== 0n
          ? humanReadableNumber(value, {
              decimals: token?.decimals ?? 0,
            })
          : value?.toString()}
      <span
        class="w-full input py-0 px-0 ring-0 focus:ring-0 text-surface-contrast-50 placeholder:text-surface-contrast-50 h-10 leading-10"
        style:font-size={`${largeInputFontScaler(humanReadable?.length ?? 0)}px`}
        >{valIsNumber ? humanReadable : '0'}</span>
    {:else}
      <NumericInput
        {id}
        class="w-full input py-0 px-0 ring-0 focus:ring-0 text-surface-contrast-50 placeholder:text-surface-contrast-50 h-10 leading-10 tracking-tight"
        textClass="text-left font-inter text-surface-contrast-50"
        {value}
        decimals={token?.decimals ?? 0}
        {disabled}
        {oninput} />
    {/if}
    {#if readonlyTokenSelect}
      <SelectButtonContents {token} network={token?.chainId ?? 0} hideChevron disableHover />
    {:else}
      <ModalWrapper
        wrapperClasses="flex items-center justify-center h-full"
        triggerClasses=""
        contentClasses="">
        {#snippet button()}
          <SelectButtonContents {token} network={token?.chainId ?? 0} />
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
</Section>

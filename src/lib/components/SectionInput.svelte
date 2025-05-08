<script lang="ts">
  import type { InputValue, Token } from '../types.svelte'
  import _ from 'lodash'
  import NumericInput from './NumericInput.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import SelectButtonContents from './SelectButtonContents.svelte'
  import type { Snippet } from 'svelte'
  import Section from './Section.svelte'
  import { accountState } from '../stores/auth/AuthProvider.svelte'
  import BalanceReadout from './BalanceReadout.svelte'
  import { largeInputFontScaler } from '../stores/font-scaler'
  import { humanReadableNumber } from '../stores/utils'
  import Loading from './Loading.svelte'
  import Warning from './Warning.svelte'

  type Props = {
    id?: string
    label?: string
    token?: Token | null
    showRadio?: boolean
    disabled?: boolean
    invalidValue?: boolean
    valueLoadingKey?: string | null
    readonlyInput?: boolean
    readonlyTokenSelect?: boolean
    inputWarning?: string | null
    focused?: boolean
    compressed?: boolean
    dashWhenCompressed?: boolean
    overrideAccount?: string | null
    oninput?: (values: InputValue) => bigint | undefined | void
    value: bigint | null
    modal?: Snippet<[{ close: () => void }]>
    radio?: Snippet
    underinput?: Snippet
    onmax?: (v: bigint) => void
    onbalanceupdate?: (v: bigint | null) => void
    onclick?: () => void
  }
  const {
    id = _.uniqueId('section-input-'),
    token = null,
    label,
    oninput,
    invalidValue = false,
    readonlyInput = false,
    readonlyTokenSelect = false,
    disabled = false,
    focused = false,
    overrideAccount,
    value: val,
    valueLoadingKey,
    inputWarning,
    compressed = false,
    dashWhenCompressed = false,
    radio,
    modal,
    underinput,
    onmax,
    onbalanceupdate,
    onclick,
  }: Props = $props()
  const sectionDisabled = $derived(readonlyInput && readonlyTokenSelect)
  let value = $state(val)
  $effect(() => {
    value = val
  })
  const humanReadable = $derived.by(() => {
    if (!readonlyInput) {
      return null
    }
    return typeof value === 'bigint' && value !== 0n
      ? humanReadableNumber(value as bigint, {
          decimals: token?.decimals ?? 0,
        })
      : _.isString(value)
        ? value
        : '-'
  })
</script>

<Section {id} {focused} disabled={sectionDisabled} {compressed} {onclick}>
  {#if !compressed}
    <div class="flex flex-row justify-between w-full h-5">
      <span class="text-sm text-gray-500"
        >{#if !compressed}{label}{/if}</span>
      {@render radio?.()}
    </div>
  {/if}
  <div class="flex flex-row items-center justify-between w-full relative">
    <Warning
      show={!!inputWarning}
      tooltip={inputWarning ?? ''}
      placement="left"
      wrapperPositionClass="left-0 -translate-x-full" />
    {#if compressed && dashWhenCompressed}
      <span class="h-10 leading-10 font-inter text-[36px] tracking-tight">-</span>
    {:else if readonlyInput}
      <span
        class="w-full input py-0 px-0 ring-0 focus:ring-0 text-surface-contrast-50 placeholder:text-surface-contrast-50 h-10 leading-10 font-inter tracking-tight"
        style:font-size={`${largeInputFontScaler(humanReadable?.length ?? 0)}px`}
        >{!token?.decimals ? '0' : humanReadable}</span>
    {:else}
      <NumericInput
        {id}
        class="w-full input py-0 px-0 ring-0 focus:ring-0 h-10 leading-10 tracking-tight"
        textClass="text-left font-inter"
        value={typeof value === 'bigint' ? value : null}
        decimals={token?.decimals ?? null}
        invalid={invalidValue}
        {disabled}
        {oninput} />
    {/if}
    {#if valueLoadingKey}
      <Loading key={valueLoadingKey} class="px-2 box-content" />
    {/if}
    {#if readonlyTokenSelect}
      <SelectButtonContents {token} network={token?.chainId ?? 0} hideChevron disableHover />
    {:else}
      <ModalWrapper
        wrapperClasses="flex items-center justify-center h-full"
        triggerClasses=""
        contentClasses="">
        {#snippet button()}
          <SelectButtonContents {token} network={token?.chainId ?? 0} class="bg-white" />
        {/snippet}
        {#snippet contents({ close })}
          {@render modal?.({ close })}
        {/snippet}
      </ModalWrapper>
    {/if}
  </div>

  {#if !compressed || underinput}
    <div class="flex gap-1 flex-row-reverse justify-between grow w-full h-5">
      {#if (overrideAccount || accountState.address) && (!!onmax || !!onbalanceupdate)}
        <BalanceReadout
          {token}
          account={overrideAccount ?? accountState.address}
          showLoader
          roundedClasses=""
          hideSymbol
          decimalLimit={9}
          {onbalanceupdate}
          {onmax} />
      {/if}
      {@render underinput?.()}
    </div>
  {/if}
</Section>

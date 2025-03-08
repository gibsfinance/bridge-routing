<script lang="ts">
  import NetworkSummary from './NetworkSummary.svelte'
  import { formatUnits, parseUnits } from 'viem'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import * as input from '$lib/stores/input.svelte'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import Warning from './Warning.svelte'
  import Icon from '@iconify/svelte'
  import type { FormEventHandler } from 'svelte/elements'
  import {
    minAmount,
    fromTokenBalance,
    tokenOriginationChainId,
    assetLink,
  } from '$lib/stores/chain-events.svelte'
  import { humanReadableNumber, stripNonNumber } from '$lib/stores/utils'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { goto } from '$app/navigation'
  import type { Token } from '$lib/types.svelte'

  let inputValue = $state('')
  let focused = $state(false)

  const chooseTokenSubmit = async (token: Token) => {
    const bridgeKey = input.bridgeKey.value
    const hashPath = `#/delivery/${input.toPath(bridgeKey)}/${token.address}`
    await goto(hashPath)
    const native = input.isNative(token, bridgeKey)
    input.unwrap.value = native
    input.fee.value = bridgeSettings.desiredExcessCompensationBasisPoints
  }
  const handleInput: FormEventHandler<HTMLInputElement> = (e) => {
    inputValue = e.currentTarget.value
  }
  const decimals = $derived(bridgeSettings.assetIn.value?.decimals || 18)
  const handleMaxBalance = () => {
    if (typeof fromTokenBalance.value !== 'bigint') {
      return
    }
    const updated = formatUnits(fromTokenBalance.value, decimals)
    inputValue = updated
  }
  const minTooltip = $derived(minAmount.value ? formatUnits(minAmount.value, decimals) : '...')
  $effect(() => {
    const inValue = parseUnits(stripNonNumber(inputValue), decimals)
    input.amountIn.value = inValue
  })
  const showWarning = $derived(
    !!minAmount.value &&
      bridgeSettings.amountToBridge < minAmount.value &&
      bridgeSettings.amountToBridge > 0n,
  )
</script>

<div class="rounded-lg shadow-xs transition-shadow hover:shadow-sm">
  <div class="rounded-t-lg bg-slate-50 px-3 py-2">
    <NetworkSummary
      network={bridgeKey.fromChain}
      unwrap={false}
      asset={bridgeSettings.assetIn.value}
      inChain
      balance={fromTokenBalance.value}
      onmax={handleMaxBalance} />
  </div>
  <div class="mt-[1px] flex flex-row justify-between rounded-b-lg bg-slate-50 text-xl">
    <span class="relative flex max-w-[70%] grow">
      <input
        class="w-full grow bg-transparent border-none px-3 py-2 text-xl leading-8 placeholder-current outline-hidden hover:appearance-none focus:shadow-inner sm:text-2xl focus:ring-0"
        placeholder="0"
        value={inputValue}
        oninput={handleInput}
        onfocus={() => {
          inputValue = stripNonNumber(inputValue)
          focused = true
        }}
        onblur={() => {
          const value = parseUnits(stripNonNumber(inputValue), decimals)
          inputValue = humanReadableNumber(value, { decimals })
          focused = false
        }} />
      <Warning
        show={showWarning}
        disabled={focused}
        placement="left"
        tooltip="Input is too low, must be at least {minTooltip}" />
    </span>
    <ModalWrapper
      triggerClasses="open-modal-container relative flex flex-row items-center py-2 pr-3 pl-2 leading-8">
      {#snippet button()}
        {@const network = tokenOriginationChainId(assetLink.value)}
        {#if !!bridgeSettings.assetIn.value && network}
          <AssetWithNetwork asset={bridgeSettings.assetIn.value} {network} />
          <span class="ml-2">{bridgeSettings.assetIn.value?.symbol || ''}</span>
        {/if}
        <Icon
          icon="mingcute:right-fill"
          height="1em"
          width="1em"
          class="icon flex transition-all ml-2" />
      {/snippet}
      {#snippet contents({ close })}
        <TokenSelect
          showCustomTokens
          chain={bridgeKey.fromChain}
          partnerChain={bridgeKey.toChain}
          onsubmit={(tkn) => {
            chooseTokenSubmit(tkn)
            close()
          }} />
      {/snippet}
    </ModalWrapper>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss/theme";
  :global(.open-modal-container:hover .icon) {
    @apply translate-x-1;
  }
  :global(.open-modal-container) {
    @apply transition-all;
  }
</style>

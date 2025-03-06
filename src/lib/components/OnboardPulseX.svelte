<script lang="ts">
  import { assetSources, bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { getPulseXQuote, type PulsexQuoteOutput, type TradeType } from '$lib/stores/pulsex.svelte'
  import Icon from '@iconify/svelte'
  import type { Token } from '$lib/types.svelte'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import VerticalDivider from './VerticalDivider.svelte'
  import NumericInput from './NumericInput.svelte'
  import BalanceReadout from './BalanceReadout.svelte'
  import { formatUnits } from 'viem'
  import { latestBlock } from '$lib/stores/chain-events.svelte'
  import Loading from './Loading.svelte'
  import Button from './Button.svelte'
  // import { sendTransaction } from '@wagmi/core'
  // import { wagmiAdapter } from '$lib/stores/auth/AuthProvider.svelte'
  // import * as SDK from '@pulsex/sdk'

  import { onboardSettings } from '$lib/stores/onboard.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import GuideStep from './GuideStep.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import TokenInfo from './TokenInfo.svelte'
  import GuideShield from './GuideShield.svelte'
  import { showTooltips } from '$lib/stores/storage.svelte'
  import { untrack } from 'svelte'
  const tokenOut = $derived(onboardSettings.plsOutToken)
  const tokenInURI = $derived(bridgeSettings.assetIn.value?.logoURI)
  const bridgeTokenOut = $derived(bridgeSettings.assetOut.value as Token | null)
  const tokenIn = $derived(
    bridgeTokenOut && tokenInURI
      ? ({
          ...bridgeTokenOut,
          logoURI: tokenInURI,
        } as Token)
      : null,
  )
  let amountInControl = $state(true)
  let amountToSwapIn = $state<bigint | null>(0n)
  let amountToSwapOut = $state<bigint | null>(null)
  let quoteResult = $state<PulsexQuoteOutput | null>(null)
  $effect(() => {
    if (
      !tokenIn ||
      !tokenOut ||
      (!amountToSwapIn && !amountToSwapOut) ||
      !untrack(() => latestBlock.block(Chains.PLS))
    ) {
      return
    }
    const quote = getPulseXQuote({
      tokenIn,
      tokenOut,
      amountIn: amountInControl ? amountToSwapIn : null,
      amountOut: amountInControl ? null : amountToSwapOut,
    })
    quote.promise.then((result) => {
      if (quote.controller.signal.aborted || !result) return
      quoteResult = result
      if (amountInControl) {
        amountToSwapOut = truncateValue(result.outputAmount.value, tokenOut.decimals)
      } else {
        amountToSwapIn = truncateValue(result.inputAmount.value, tokenIn.decimals)
      }
    })
    return quote.cleanup
  })
  const truncateValue = (value: string, decimals: number) => {
    const int = BigInt(value)
    const decimal = formatUnits(int, decimals)
    const [i, d] = decimal.split('.')
    if (i.length > 3) {
      // truncate to half the number of decimals
      const targetDecimals = Math.floor(decimals / 2)
      const delta = decimals - targetDecimals
      const expanded = 10n ** BigInt(delta)
      // truncate to half the number of decimals from the bigint
      return (int / expanded) * expanded
    }
    return int
  }
  const swapButtonClassNames = $derived(
    'btn bg-tertiary-500 text-surface-contrast-950 h-16 rounded-none px-4 w-16 text-base',
  )
  const swapTokens = () => {
    // SDK.
    // sendTransaction(wagmiAdapter.wagmiConfig, {
    // to: quoteResult?.outputAmount.address,
    // value: quoteResult?.inputAmount.value,
    // data: quoteResult?.calldata,
    // })
    // amountInControl = !amountInControl
    // amountToSwapIn = null
    // amountToSwapOut = null
  }
  const estimatedAmount = $derived(amountToSwapOut)
  const tokenOutWithPrefixedName = $derived.by(() => ({
    ...tokenOut,
    name: amountToSwapOut ? `${amountToSwapOut} ${tokenOut.symbol}` : tokenOut.symbol,
  }))
</script>

<!-- <div class="flex flex-col">
  <label for="amount-to-swap-in" class="text-surface-100 text-base italic">3) Swap on PulseX</label> -->
<div class="flex relative">
  <div
    class="w-full card preset-outline-surface-500 bg-surface-950-50 shadow-sm hover:shadow-lg transition-all duration-100 overflow-hidden">
    <header class="flex flex-row justify-between relative h-16">
      {#if tokenIn}
        <label
          for="amount-to-swap-in"
          class="flex flex-row items-center w-1/2 justify-end pr-5 gap-1">
          <div class="flex flex-row-reverse items-center gap-1 absolute top-0 left-0">
            {#if accountState.address}
              <BalanceReadout
                token={tokenIn}
                showLoader
                roundedClasses="rounded-tl"
                hideSymbol
                decimalLimit={9}
                onmax={(balance) => {
                  amountToSwapIn = balance
                }} />
            {/if}
          </div>
          <NumericInput
            class="w-full input ring-0 focus:ring-0 text-right placeholder:text-gray-600 text-surface-contrast-50 text-base"
            value={amountToSwapIn}
            id="amount-to-swap-in"
            decimals={tokenIn.decimals}
            oninput={(v) => {
              amountInControl = true
              amountToSwapIn = v
              amountToSwapOut = null
            }} />
          <AssetWithNetwork asset={tokenIn} network={Chains.PLS} />
        </label>
        <VerticalDivider>
          <Icon
            icon="gridicons:chevron-right"
            class="text-surface-500 bg-surface-950-50 rounded-full w-full h-full ring-2 ring-current ring-inset p-0.5" />
        </VerticalDivider>
        <div class="flex flex-row grow items-center w-1/2">
          <label for="amount-to-swap-out" class="flex flex-row grow items-center h-full gap-1">
            <!-- output token -->
            <!-- <AssetWithNetwork
              asset={tokenOutWithCorrectLogoURI}
              network={Chains.PLS}
              class="text-surface-900" />
            <NumericInput
              paddingClass="px-0"
              class="w-full input ring-0 focus:ring-0 placeholder:text-gray-600 placeholder: text-surface-contrast-50 text-base"
              value={amountToSwapOut}
              id="amount-to-swap-out"
              decimals={tokenOut.decimals}
              oninput={(v) => {
                amountInControl = false
                amountToSwapOut = v
                amountToSwapIn = null
              }} /> -->
            <div class="flex w-full">
              <ModalWrapper
                wrapperClasses="grow h-full"
                triggerClasses="pl-4 py-4 flex relative justify-end grow h-full items-center gap-2 text-surface-contrast-50 group w-full">
                {#snippet button()}
                  <span class="flex flex-row px-1 w-full">
                    <TokenInfo
                      token={tokenOutWithPrefixedName}
                      truncate={8}
                      reversed={false}
                      externalGroup
                      wrapperSizeClasses="w-full h-8"
                      nameClasses="text-base" />
                  </span>
                {/snippet}
                {#snippet contents({ close })}
                  <TokenSelect
                    chain={Chains.PLS}
                    onsubmit={(tkn) => {
                      onboardSettings.plsOutToken = tkn
                      close()
                    }} />
                {/snippet}
              </ModalWrapper>
            </div>
          </label>
          <Button disabled class={swapButtonClassNames} onclick={swapTokens}>
            <Loading key="pulsex-quote">
              {#snippet contents()}Go{/snippet}
            </Loading>
          </Button>
        </div>
      {/if}
    </header>
  </div>
  <GuideShield show={showTooltips.value} class="rounded-xl" />
  <div class="absolute top-2 right-1/4 -translate-x-1/2 pointer-events-none">
    <GuideStep step={7}>Select your output token</GuideStep>
  </div>
  <div class="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 pointer-events-none">
    <GuideStep step={8}>Input an amount to swap to your output token</GuideStep>
  </div>
  <div class="absolute bottom-1 right-16 translate-x-1/2 pointer-events-none">
    <GuideStep step={9}>Initiate swap transaction</GuideStep>
  </div>
</div>

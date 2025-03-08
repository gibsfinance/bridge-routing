<script lang="ts">
  import * as transactions from '$lib/stores/transactions'
  import { assetSources, bridgeSettings, oneEther } from '$lib/stores/bridge-settings.svelte'
  import { getPulseXQuote } from '$lib/stores/pulsex/quote.svelte'
  import type { SerializedTrade } from '$lib/stores/pulsex/transformers'
  import Icon from '@iconify/svelte'
  import type { Token } from '$lib/types.svelte'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import VerticalDivider from './ExchangeInputDivider.svelte'
  import NumericInput from './NumericInput.svelte'
  import BalanceReadout from './BalanceReadout.svelte'
  import { formatUnits, getAddress, zeroAddress, type Hex } from 'viem'
  import { latestBlock } from '$lib/stores/chain-events.svelte'
  import Loading from './Loading.svelte'
  import Button from './Button.svelte'
  // import { sendTransaction } from '@wagmi/core'
  // import { wagmiAdapter } from '$lib/stores/auth/AuthProvider.svelte'
  // import * as SDK from '@pulsex/sdk'

  // import { onboardSettings } from '$lib/stores/onboard.svelte'
  import { plsOutToken } from '$lib/stores/storage.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import GuideStep from './GuideStep.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import TokenInfo from './TokenInfo.svelte'
  import GuideShield from './GuideShield.svelte'
  import { showTooltips, storage } from '$lib/stores/storage.svelte'
  // import { untrack } from 'svelte'
  import { humanReadableNumber } from '$lib/stores/utils'
  // import { clientFromChain } from '$lib/stores/input.svelte'
  // import { chainsMetadata } from '$lib/stores/auth/constants'
  import { getTransactionDataFromTrade } from '$lib/stores/pulsex/serialize'
  import { bridgableTokens, bridgeableTokensUnder } from '$lib/stores/input.svelte'
  import OnboardStep from './OnboardStep.svelte'
  import SectionInput from './SectionInput.svelte'
  import OnboardButton from './OnboardButton.svelte'
  const tokenOutputAddress = $derived(plsOutToken.value)
  const tokens = $derived(
    bridgableTokens.bridgeableTokensUnder({
      chain: Chains.PLS,
      partnerChain: null,
    }),
  )
  $inspect(tokens)
  const tokenOut = $derived.by(() => {
    // const tokens =
    return tokens.find((t) => getAddress(t.address) === getAddress(tokenOutputAddress)) ?? tokens[0]
  })
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
  // let amountInControl = $state(true)
  let amountToSwapIn = $state<bigint | null>(0n)
  let amountToSwapOut = $state<bigint | null>(null)
  let quoteResult = $state<SerializedTrade | null>(null)
  $effect(() => {
    if (
      !tokenIn ||
      !tokenOut ||
      (!amountToSwapIn && !amountToSwapOut) ||
      !latestBlock.block(Number(Chains.PLS))
    ) {
      return
    }
    const quote = getPulseXQuote({
      tokenIn,
      tokenOut,
      amountIn: amountToSwapIn,
      amountOut: null,
    })
    quote.promise.then((result) => {
      if (quote.controller.signal.aborted || !result) return
      quoteResult = result
      console.log(result)
      amountToSwapOut = truncateValue(result.outputAmount.value, tokenOut.decimals)
    })
    return quote.cleanup
  })
  const quoteMatchesLatest = $derived.by(() => {
    if (!quoteResult || !amountToSwapIn) return false
    return quoteResult.inputAmount.value === amountToSwapIn.toString()
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
    'bg-tertiary-500 text-surface-contrast-950 rounded-none size-16 text-base flex flex-row items-center justify-center shrink-0',
  )
  const swapRouterAddress = '0xDA9aBA4eACF54E0273f56dfFee6B8F1e20B23Bba'
  const swapDisabled = $derived(!amountToSwapIn || !amountToSwapOut || !quoteMatchesLatest)
  const swapTokens = async () => {
    if (swapDisabled) return
    await transactions.checkAndRaiseApproval({
      token: tokenIn!.address! as Hex,
      spender: swapRouterAddress,
      chainId: Number(Chains.PLS),
      minimum: amountToSwapIn!,
    })
    const transactionInfo = getTransactionDataFromTrade(Number(Chains.PLS), quoteResult!)
    const tx = await transactions.sendTransaction({
      data: transactionInfo.calldata as Hex,
      to: swapRouterAddress,
      // gas: BigInt(quoteResult!.gasEstimate!),
      value: BigInt(transactionInfo.value),
      chainId: Number(Chains.PLS),
    })
    await transactions.wait(tx)
  }

  const estimatedAmount = $derived.by(() => {
    if (!quoteMatchesLatest) return ''
    const amountToSwapOutInt = amountToSwapOut ?? 0n
    const amountToSwapOutToken = amountToSwapOutInt / oneEther
    const lengthInt = amountToSwapOutToken.toString().length
    const maxDecimals = Math.max(4, 9 - Math.max(0, lengthInt - 5))
    return humanReadableNumber(amountToSwapOutInt, {
      decimals: tokenOut.decimals,
      maxDecimals,
    })
  })
  const tokenOutWithPrefixedName = $derived.by(() => ({
    ...tokenOut,
    name: estimatedAmount ? `${estimatedAmount} ${tokenOut.symbol}` : tokenOut.symbol,
  }))
  // const bridgeableTokensPLS = $derived(
  //   bridgeableTokensUnder({
  //     // tokens: bridgableTokens.value,
  //     chain: Chains.PLS,
  //     partnerChain: null,
  //   }),
  // )
  // $inspect(bridgeableTokensPLS)
</script>

<OnboardStep icon="token:swap" step={3}>
  {#snippet input()}
    <SectionInput
      focused
      label="Input"
      token={tokenIn ?? {
        address: zeroAddress,
        chainId: Number(Chains.PLS),
        decimals: 18,
        logoURI: assetSources(tokenIn),
        symbol: 'ETH',
        name: 'Ether',
      }}
      showRadio
      value={amountToSwapIn ?? 0n}
      onbalanceupdate={(balance) => {
        // maxBridgeable = balance
      }}
      onmax={(balance) => {
        amountToSwapIn = balance
      }}
      oninput={(v) => {
        amountToSwapIn = v
      }}>
      {#snippet modal({ close })}
        <TokenSelect
          chain={Chains.PLS}
          {tokens}
          onsubmit={(tkn) => {
            bridgeSettings.assetOut.value = tkn as Token
            close()
          }} />
      {/snippet}
    </SectionInput>
    <!-- {#if tokenIn}
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
            amountToSwapIn = v
            amountToSwapOut = null
          }} />
        <AssetWithNetwork asset={tokenIn} network={Number(Chains.PLS)} />
      </label>
    {/if} -->
  {/snippet}
  {#snippet output()}
    <SectionInput
      label="Output"
      token={tokenOut ?? {
        address: zeroAddress,
        chainId: Number(Chains.PLS),
        decimals: 18,
        logoURI: assetSources(tokenOut),
        symbol: 'ETH',
        name: 'Ether',
      }}
      onbalanceupdate={() => {}}
      value={amountToSwapOut ?? 0n}>
      {#snippet modal({ close })}
        <TokenSelect
          chain={Chains.PLS}
          {tokens}
          onsubmit={(tkn) => {
            plsOutToken.value = tkn.address as Hex
            close()
          }} />
      {/snippet}
    </SectionInput>
  {/snippet}
  {#snippet button()}
    <!-- <Button
      disabled={swapDisabled}
      class="bg-tertiary-500 text-surface-contrast-950 h-14 rounded-2xl w-full text-xl flex flex-row items-center justify-center shrink-0"
      onclick={swapTokens}>
      <Loading key="lifi-quote">
        {#snippet contents()}Swap{/snippet}
      </Loading>
    </Button> -->

    <OnboardButton
      disabled={swapDisabled}
      onclick={swapTokens}
      text="Swap"
      loadingKey="lifi-quote" />
  {/snippet}
</OnboardStep>
<!-- <div class="flex relative">
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
              amountToSwapIn = v
              amountToSwapOut = null
            }} />
          <AssetWithNetwork asset={tokenIn} network={Number(Chains.PLS)} />
        </label>
        <VerticalDivider>
          <Icon
            icon="gridicons:chevron-right"
            class="text-surface-500 bg-surface-950-50 rounded-full w-full h-full ring-2 ring-current ring-inset p-0.5" />
        </VerticalDivider>
        <div class="flex flex-row grow items-center w-1/2 justify-end">
          <label
            for="amount-to-swap-out"
            class="flex flex-row grow items-center h-full gap-1 min-w-0">
            <ModalWrapper
              wrapperClasses="grow h-full flex w-full"
              triggerClasses="pl-4 py-4 flex relative grow justify-end h-full items-center gap-2 text-surface-contrast-50 group w-full">
              {#snippet button()}
                <TokenInfo
                  token={tokenOutWithPrefixedName}
                  truncate={8}
                  externalGroup
                  wrapperSizeClasses="h-8 min-w-0 overflow-hidden flex grow px-1"
                  nameClasses="text-base truncate" />
              {/snippet}
              {#snippet contents({ close })}
                <TokenSelect
                  showCustomTokens
                  chain={Chains.PLS}
                  onsubmit={(tkn) => {
                    plsOutToken.value = tkn.address as Hex
                    close()
                  }} />
              {/snippet}
            </ModalWrapper>
          </label>
          <Button disabled={swapDisabled} class={swapButtonClassNames} onclick={swapTokens}>
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
</div> -->

<script lang="ts">
  import Icon from '@iconify/svelte'
  import VerticalDivider from './VerticalDivider.svelte'
  import Button from './Button.svelte'
  import { formatUnits, zeroAddress, type Hex } from 'viem'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import NumericInput from './NumericInput.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import TokenAndNetworkSelector from './TokenAndNetworkSelector.svelte'
  import type { Token } from '$lib/types.svelte'
  import GuideStep from './GuideStep.svelte'
  import {
    availableChains,
    availableTokensPerOriginChain,
    loadData,
    loadTokensForChains,
    loadTools,
    getQuoteStep,
  } from '$lib/stores/objective.svelte'
  import { accountState, wagmiAdapter } from '$lib/stores/auth/AuthProvider.svelte'
  import type { RelayerQuoteResponseData } from '@lifi/types'
  import _ from 'lodash'
  import TokenInfo from './TokenInfo.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import { sendTransaction } from '@wagmi/core'
  import Loading from './Loading.svelte'
  import BalanceReadout from './BalanceReadout.svelte'
  import { showTooltips } from '$lib/stores/storage.svelte'
  import GuideShield from './GuideShield.svelte'
  let tokenInput: Token = $state({
    logoURI: `https://gib.show/image/137`,
    name: 'Poly',
    symbol: 'POL',
    decimals: 18,
    chainId: 137,
    address: zeroAddress,
  })
  let tokenOutput = $state({
    logoURI: `https://gib.show/image/1/${zeroAddress}`,
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    chainId: 1,
    address: zeroAddress,
  })
  let amountInput = $state(0n)
  let maxBridgeable = $state(0n as bigint | null)
  $effect(() => {
    if (maxBridgeable && amountInput > maxBridgeable) {
      amountInput = maxBridgeable
    }
  })

  $effect(() => {
    Promise.all([loadData(), loadTools()]).then(async () => {
      const polygon = availableChains.get(137)!
      await loadTokensForChains(polygon)
      const tokens = availableTokensPerOriginChain.get(polygon.id)!
      const first = tokens[0]
      if (first) {
        tokenInput = first as Token
      }
    })
  })
  const quoteInputs = $derived.by(() => {
    const fromChain = availableChains.get(tokenInput.chainId)
    const toChain = availableChains.get(tokenOutput.chainId)
    if (!fromChain || !toChain) return null
    const originTokens = availableTokensPerOriginChain.get(fromChain!.id)
    if (!originTokens) return null
    const fromToken = originTokens.find((t) => t.address === tokenInput.address)
    const toToken = originTokens.find((t) => t.address === tokenOutput.address)
    const fromAddress = accountState.address ?? ''
    let toAddress = fromAddress
    if (
      !fromChain ||
      !toChain ||
      !fromToken ||
      !toToken ||
      !amountInput ||
      !fromAddress ||
      !toAddress
    )
      return null
    return {
      fromChain: fromChain.id,
      toChain: toChain.id,
      fromToken: fromToken.address,
      toToken: toToken.address,
      fromAmount: amountInput.toString(),
      fromAddress,
      toAddress,
    }
  })
  let latestQuote: RelayerQuoteResponseData['quote'] | null = $state(null)
  $effect(() => {
    // console.log(quoteInputs)
    if (!quoteInputs) return
    const quote = getQuoteStep(quoteInputs)
    quote.promise.then((q) => {
      if (quote.controller.signal.aborted) return
      latestQuote = q
    })
    return quote.cleanup
  })
  const quoteMatchesLatest = $derived.by(() => {
    if (!latestQuote || !quoteInputs) return false
    const { action } = latestQuote
    const {
      fromChainId: fromChain,
      fromToken,
      toChainId: toChain,
      toToken,
      fromAddress,
      toAddress,
    } = action
    const derived = {
      fromChain,
      fromToken: fromToken.address,
      toChain,
      toToken: toToken.address,
      fromAddress,
      toAddress,
      fromAmount: quoteInputs.fromAmount,
    }
    return _.isEqual(derived, quoteInputs)
  })
  const estimatedAmount = $derived.by(() => {
    if (!quoteMatchesLatest) return ''
    const formatted = formatUnits(BigInt(latestQuote!.estimate.toAmount), tokenOutput.decimals)
    const [i, d] = formatted.split('.')
    return `${i}.${d.slice(0, 9)}`
  })
  const tokenOutWithPrefixedName = $derived.by(() => ({
    ...tokenOutput,
    name: estimatedAmount ? `${estimatedAmount} ${tokenOutput.symbol}` : tokenOutput.symbol,
  }))
  const crossForeignBridge = async () => {
    const tx = await sendTransaction(wagmiAdapter.wagmiConfig, {
      account: accountState.address,
      data: latestQuote!.transactionRequest!.data as Hex,
      gas: BigInt(latestQuote!.transactionRequest!.gasLimit ?? 0),
      gasPrice: BigInt(latestQuote!.transactionRequest!.gasPrice ?? 0),
      to: latestQuote!.transactionRequest!.to as Hex,
      value: BigInt(latestQuote!.transactionRequest!.value ?? 0),
    })
    console.log(tx)
  }
</script>

<!-- <div class="flex flex-col">
  <label for="foreign-bridge-amount-in" class="text-surface-100 text-base italic"
    >1) Bridge to Ethereum</label> -->
<div class="flex relative">
  <div
    class="w-full card preset-outline-surface-500 bg-surface-950-50 shadow-sm hover:shadow-lg transition-all duration-100 overflow-hidden relative flex flex-row">
    <div class="flex flex-row items-center justify-between w-1/2 gap-1">
      {#if accountState.address}
        <div class="flex gap-1 flex-row-reverse absolute top-0 left-0">
          <BalanceReadout
            token={tokenInput}
            roundedClasses="rounded-tl"
            hideSymbol
            decimalLimit={9}
            onbalanceupdate={(balance) => {
              maxBridgeable = balance
            }}
            onmax={(balance) => {
              // amountIn.value = balance
              amountInput = balance
            }} />
        </div>
      {/if}
      <label
        for="foreign-bridge-amount-in"
        class="flex flex-row items-center justify-items-end py-4 grow gap-1 relative">
        <NumericInput
          class="w-full text-base input py-0 px-0 ring-0 focus:ring-0 text-surface-contrast-50 text-right placeholder:text-gray-600 leading-6 h-8"
          id="foreign-bridge-amount-in"
          value={amountInput}
          decimals={tokenInput.decimals}
          oninput={(v) => {
            amountInput = v
          }} />
        <span class="text-surface-contrast-50 leading-8 text-base">{tokenInput.symbol}</span>
      </label>
      <ModalWrapper
        wrapperClasses="flex items-center justify-center h-full"
        triggerClasses="h-full pr-5">
        {#snippet button()}
          <AssetWithNetwork asset={tokenInput} />
        {/snippet}
        {#snippet contents({ close })}
          <TokenAndNetworkSelector
            token={tokenInput}
            onSelect={(token) => {
              tokenInput = token
              close()
            }} />
        {/snippet}
      </ModalWrapper>
    </div>
    <VerticalDivider>
      <Icon
        icon="material-symbols:captive-portal"
        class="text-surface-500 bg-surface-950-50 rounded-full w-full h-full ring-2 ring-current ring-inset p-1" />
    </VerticalDivider>
    <div class="flex grow w-1/2">
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
              chain={Chains.ETH}
              onsubmit={(tkn) => {
                bridgeSettings.assetOut.value = tkn
                close()
              }} />
          {/snippet}
        </ModalWrapper>
      </div>
      <div class="flex items-center justify-center">
        <Button
          disabled={!quoteMatchesLatest}
          class="bg-tertiary-500 px-2 text-base size-16 flex items-center justify-center"
          onclick={crossForeignBridge}>
          <Loading key="lifi-quote">
            {#snippet contents()}Go{/snippet}
          </Loading>
        </Button>
      </div>
    </div>
  </div>
  <GuideShield show={showTooltips.value} class="rounded-xl" />
  <div class="absolute top-1 left-1/2 -translate-x-5/4 pointer-events-none">
    <GuideStep step={1}>Select your input token and network</GuideStep>
  </div>
  <div class="absolute top-2 right-1/4 -translate-x-1/2 pointer-events-none">
    <GuideStep step={2}>Select your output token</GuideStep>
  </div>
  <div class="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 pointer-events-none">
    <GuideStep step={3}>Enter the amount you want to bridge to Ethereum</GuideStep>
  </div>
  <div class="absolute bottom-1 right-16 translate-x-1/2 pointer-events-none">
    <GuideStep step={4}>Initiate the transaction to bridge to Ethereum</GuideStep>
  </div>
</div>

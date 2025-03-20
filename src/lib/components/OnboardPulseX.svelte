<script lang="ts">
  import * as transactions from '$lib/stores/transactions'
  import { assetOutKey, assetSources, bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { getPulseXQuote } from '$lib/stores/pulsex/quote.svelte'
  import type { SerializedTrade } from '$lib/stores/pulsex/transformers'
  import type { Token } from '$lib/types.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { formatUnits, getAddress, zeroAddress, type Hex } from 'viem'
  import { latestBlock } from '$lib/stores/chain-events.svelte'
  import { plsOutToken, showTooltips } from '$lib/stores/storage.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { getTransactionDataFromTrade } from '$lib/stores/pulsex/serialize'
  import { bridgableTokens, bridgeKey } from '$lib/stores/input.svelte'
  import InputOutputForm from './InputOutputForm.svelte'
  import SectionInput from './SectionInput.svelte'
  import OnboardButton from './OnboardButton.svelte'
  import { pulsechain } from 'viem/chains'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
  import OnboardRadio from './OnboardRadio.svelte'
  import GuideShield from './GuideShield.svelte'
  import GuideStep from './GuideStep.svelte'

  const toast = getContext('toast') as ToastContext

  const tokenOutputAddress = $derived(plsOutToken.value)
  const tokens = $derived(
    bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(Chains.PLS),
      partnerChain: null,
    }),
  )
  const defaultTokenIn = $derived(tokens.find((t) => t.symbol === 'wWETH'))
  const tokenOut = $derived.by(() => {
    return tokens.find((t) => getAddress(t.address) === getAddress(tokenOutputAddress)) ?? tokens[0]
  })
  const tokenInURI = $derived(bridgeSettings.assetIn.value?.logoURI)
  const bridgeTokenOut = $derived((bridgeSettings.assetOut as Token | null) ?? defaultTokenIn)
  const tokenIn = $derived(
    bridgeTokenOut
      ? ({
          ...bridgeTokenOut,
          logoURI: tokenInURI ?? null,
        } as Token)
      : null,
  )
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
      // console.log(result)
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
    const [i] = decimal.split('.')
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
  const swapRouterAddress = '0xDA9aBA4eACF54E0273f56dfFee6B8F1e20B23Bba'
  const swapDisabled = $derived(!amountToSwapIn || !amountToSwapOut || !quoteMatchesLatest)
  const swapTokens = transactionButtonPress({
    toast,
    steps: [
      async () => {
        if (swapDisabled) return
        return await transactions.checkAndRaiseApproval({
          token: tokenIn!.address! as Hex,
          spender: swapRouterAddress,
          chainId: Number(Chains.PLS),
          minimum: amountToSwapIn!,
        })
      },
      async () => {
        const transactionInfo = getTransactionDataFromTrade(Number(Chains.PLS), quoteResult!)
        const tx = await transactions.sendTransaction({
          data: transactionInfo.calldata as Hex,
          to: swapRouterAddress,
          // gas: BigInt(quoteResult!.gasEstimate!),
          value: BigInt(transactionInfo.value),
          chainId: Number(Chains.PLS),
        })
        return tx
      },
    ],
  })
</script>

<InputOutputForm
  icon="token:swap"
  ondividerclick={() => {
    const futureInput = tokenOut
    plsOutToken.value = bridgeSettings.assetOut?.address as Hex
    const key = assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: tokenIn?.address as Hex,
      unwrap: false,
    })
    if (key) {
      bridgeSettings.setAssetOut(key, futureInput)
    }
  }}>
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
      onbalanceupdate={() => {
        // maxBridgeable = balance
      }}
      onmax={(balance) => {
        amountToSwapIn = balance
      }}
      oninput={(v) => {
        amountToSwapIn = v
      }}>
      {#snippet radio()}
        <OnboardRadio />
      {/snippet}
      {#snippet modal({ close })}
        <TokenSelect
          chains={[Number(Chains.PLS)]}
          selectedChain={Number(Chains.PLS)}
          selectedToken={tokenIn}
          {tokens}
          onsubmit={(tkn) => {
            if (tkn) {
              const key = assetOutKey({
                bridgeKeyPath: bridgeKey.path,
                assetInAddress: tokenIn?.address as Hex,
                unwrap: false,
              })
              if (key) {
                bridgeSettings.setAssetOut(key, tkn as Token)
              }
            }
            close()
          }} />
      {/snippet}
    </SectionInput>
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
      readonlyInput
      onbalanceupdate={() => {}}
      value={amountToSwapOut ?? 0n}>
      {#snippet modal({ close })}
        <TokenSelect
          chains={[Number(Chains.PLS)]}
          selectedChain={Number(Chains.PLS)}
          selectedToken={tokenOut}
          {tokens}
          onsubmit={(tkn) => {
            if (tkn) {
              plsOutToken.value = tkn.address as Hex
            }
            close()
          }} />
      {/snippet}
    </SectionInput>
  {/snippet}
  {#snippet button()}
    <OnboardButton
      requiredChain={pulsechain}
      disabled={swapDisabled}
      onclick={swapTokens}
      text="Swap"
      loadingKey="pulsex-quote" />
  {/snippet}
</InputOutputForm>

{#if showTooltips.value}
  <div class="absolute top-0 left-0 w-full h-full">
    <GuideShield show={true} />
    <GuideStep step={1} triggerClass="absolute top-9 right-5">
      <p>Select the token you wish to swap from.</p>
    </GuideStep>
    <GuideStep step={2} triggerClass="absolute top-24 left-5">
      <p>Set an amount to swap.</p>
    </GuideStep>
    <GuideStep step={3} triggerClass="absolute right-5 bottom-36 mx-auto">
      <p>Select output token.</p>
    </GuideStep>
    <GuideStep step={4} triggerClass="absolute left-0 right-0 mx-auto bottom-5">
      <p>Initiate the swap.</p>
    </GuideStep>
  </div>
{/if}

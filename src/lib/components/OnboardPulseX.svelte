<script lang="ts">
  import * as transactions from '$lib/stores/transactions'
  import { assetOutKey, bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { getPulseXQuote } from '$lib/stores/pulsex/quote.svelte'
  import type { SerializedTrade } from '$lib/stores/pulsex/transformers'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import { formatUnits, getAddress, zeroAddress, type Hex } from 'viem'
  import { latestBlock } from '$lib/stores/chain-events.svelte'
  import { plsxTokens, showTooltips, type PulsexTokens } from '$lib/stores/storage.svelte'
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
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'

  const toast = getContext('toast') as ToastContext

  // const tokenOutputAddress = $derived(plsOutToken.value)
  const defaultPulsexTokens = {
    tokenIn: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
    tokenOut: zeroAddress,
  } as const
  const { tokenIn: tokenInAddress, tokenOut: tokenOutAddress } = $derived({
    ...defaultPulsexTokens,
    ...(plsxTokens.value ?? {}),
  })
  const tokens = $derived(
    bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(Chains.PLS),
      partnerChain: null,
    }),
  )
  // const defaultTokenIn = $derived(tokens.find((t) => t.symbol === 'wWETH'))
  const findToken = (address: Hex) => {
    return tokens.find((t) => getAddress(t.address) === getAddress(address))
  }
  const tokenIn = $derived.by(() => {
    return findToken(tokenInAddress) ?? findToken(defaultPulsexTokens.tokenIn) ?? null
  })
  const tokenOut = $derived.by(() => {
    return findToken(tokenOutAddress) ?? findToken(defaultPulsexTokens.tokenOut) ?? null
  })
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
    console.log(
      'getting quote',
      tokenIn,
      tokenOut,
      amountToSwapIn,
      latestBlock.block(Number(Chains.PLS)),
    )
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
  let allowance = $state<bigint | null>(null)
  $effect.pre(() => {
    if (!tokenIn || !accountState.address) return
    const result = transactions.loadAllowance({
      account: accountState.address,
      token: tokenIn.address as Hex,
      spender: swapRouterAddress,
      chainId: Number(Chains.PLS),
    })
    result.promise.then((res) => {
      if (result.controller.signal.aborted) return
      allowance = res ?? 0n
    })
    return result.cleanup
  })
  const needsAllowance = $derived(
    tokenIn?.address !== zeroAddress &&
      amountToSwapIn !== null &&
      (!allowance || allowance < amountToSwapIn),
  )
  const askForAllowance = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(Chains.PLS),
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
      ],
    }),
  )
  const swapOnPulseX = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(Chains.PLS),
      steps: [
        async () => {
        const transactionInfo = getTransactionDataFromTrade(Number(Chains.PLS), quoteResult!)
        const tx = await transactions.sendTransaction({
          data: transactionInfo.calldata as Hex,
          to: swapRouterAddress,
          gas: BigInt(quoteResult!.gasEstimate!),
          value: BigInt(transactionInfo.value),
          chainId: Number(Chains.PLS),
        })
        return tx
      },
      ],
    }),
  )
  const swapTokens = $derived(needsAllowance ? askForAllowance : swapOnPulseX)
  const firstNotMatching = (address: Hex) => {
    return tokens.find((t) => getAddress(t.address) !== getAddress(address))?.address as Hex
  }
  const updatePulsexTokens = (tokens: Partial<PulsexTokens>) => {
    const updates = {
      ...tokens,
    }
    if (!updates.tokenIn || !updates.tokenOut) {
      if (tokenInAddress === updates.tokenOut) {
        updates.tokenIn = firstNotMatching(updates.tokenOut)
      }
      if (tokenOutAddress === updates.tokenIn) {
        updates.tokenOut = firstNotMatching(updates.tokenIn)
      }
    }
    console.log(
      tokens,
      {
        tokenInAddress,
        tokenOutAddress,
      },
      updates,
    )
    plsxTokens.extend(updates)
  }
</script>

<InputOutputForm
  icon="token:swap"
  ondividerclick={() => {
    const futureInput = tokenOut
    updatePulsexTokens({
      tokenOut: tokenIn!.address as Hex,
      tokenIn: tokenOut!.address as Hex,
    })
    const key = assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: tokenIn?.address as Hex,
      unwrap: false,
    })
    // console.log(key, futureInput)
    if (key && futureInput) {
      bridgeSettings.setAssetOut(key, futureInput)
    }
  }}>
  {#snippet input()}
    <SectionInput
      focused
      label="Input"
      token={tokenIn}
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
              updatePulsexTokens({
                tokenIn: tkn.address as Hex,
              })
            }
            close()
          }} />
      {/snippet}
    </SectionInput>
  {/snippet}
  {#snippet output()}
    <SectionInput
      label="Output"
      token={tokenOut}
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
              // plsOutToken.value = tkn.address as Hex
              updatePulsexTokens({
                tokenOut: tkn.address as Hex,
              })
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
      text={needsAllowance ? 'Approve' : 'Swap'}
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

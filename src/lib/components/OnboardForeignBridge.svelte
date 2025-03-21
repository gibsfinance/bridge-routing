<script lang="ts">
  import InputOutputForm from './InputOutputForm.svelte'
  import * as transactions from '$lib/stores/transactions'
  import { formatUnits, getAddress, zeroAddress, type Hex } from 'viem'
  import TokenAndNetworkSelector from './TokenAndNetworkSelector.svelte'
  import type { Token } from '$lib/types.svelte'
  import {
    availableChains,
    availableTokensPerOriginChain,
    getQuoteStep,
    loadData,
    loadTokensForChains,
  } from '$lib/stores/lifi.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import type { RelayerQuoteResponseData } from '@lifi/types'
  import _ from 'lodash'
  import { foreignBridgeInputs, showTooltips } from '$lib/stores/storage.svelte'
  import { untrack } from 'svelte'
  import { latestBlock } from '$lib/stores/chain-events.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import OnboardButton from './OnboardButton.svelte'
  import type { Chain as LIFIChain } from '@lifi/sdk'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
  import OnboardRadio from './OnboardRadio.svelte'
  import GuideStep from './GuideStep.svelte'
  import GuideShield from './GuideShield.svelte'

  const toast = getContext('toast') as ToastContext

  let tokenInput = $state<Token | null>(null)
  let tokenOutput = $state<Token | null>(null)
  let amountInput = $state(0n)
  let maxBridgeable = $state(0n as bigint | null)
  const getAddr = (address: Hex | string | null | undefined) => {
    return address ? address.toLowerCase() : null
  }
  $effect(() => {
    if (
      everLoaded &&
      tokenInput &&
      (tokenInput?.chainId !== foreignBridgeInputs.value?.fromChain ||
        getAddr(tokenInput?.address) !== getAddr(foreignBridgeInputs.value?.fromToken))
    ) {
      foreignBridgeInputs.extend({
        fromChain: tokenInput.chainId,
        fromToken: tokenInput.address,
      })
    }
  })
  $effect(() => {
    if (maxBridgeable && amountInput > maxBridgeable) {
      amountInput = maxBridgeable
    }
  })

  let everLoaded = $state(false)
  $effect(() => {
    let cancelled = false
    if (everLoaded) return
    loadData().then(async () => {
      if (cancelled) return
      const previousSettings = untrack(() => foreignBridgeInputs.value)
      const loadedFromChain = untrack(() => availableChains.get(previousSettings?.fromChain ?? 1)!)
      await Promise.all([
        loadTokensForChains(loadedFromChain),
        loadTokensForChains(availableChains.get(1)!),
      ])
      amountInput = previousSettings?.fromAmount ? BigInt(previousSettings.fromAmount) : 0n
      const tokensDestination = untrack(() => availableTokensPerOriginChain.get(1)!)
      const tokensOrigin = untrack(
        () => availableTokensPerOriginChain.get(previousSettings?.fromChain ?? 1)!,
      )
      const tokenOrigin = !previousSettings?.fromToken
        ? tokensOrigin[0]
        : tokensOrigin.find(
            (tkn) => getAddress(tkn.address) === getAddress(previousSettings.fromToken),
          )
      if (tokenOrigin) {
        tokenInput = tokenOrigin
      }
      const tokenDestination = !previousSettings?.toToken
        ? tokensDestination[0]
        : tokensDestination.find(
            (tkn) => getAddress(tkn.address) === getAddress(previousSettings.toToken),
          )
      if (tokenDestination) {
        tokenOutput = tokenDestination
      }
      everLoaded = true
    })
    return () => {
      cancelled = true
    }
  })
  const quoteInputs = $derived.by(() => {
    const tokenIn = tokenInput
    const tokenOut = tokenOutput
    if (!tokenIn || !tokenOut) return null
    const fromChain = availableChains.get(tokenIn.chainId)
    const toChain = availableChains.get(tokenOut.chainId)
    if (!fromChain || !toChain) {
      // console.log('no from or to chain', fromChain, toChain)
      return null
    }
    const originTokens = availableTokensPerOriginChain.get(fromChain!.id)
    if (!originTokens || !originTokens.length) {
      // console.log('no origin tokens', originTokens)
      return null
    }
    const destinationChain = availableTokensPerOriginChain.get(toChain!.id)
    if (!destinationChain || !destinationChain.length) {
      // console.log('no destination chain tokens', destinationChain)
      return null
    }
    const fromToken = originTokens.find(
      (t) => getAddress(t.address) === getAddress(tokenIn.address),
    )
    const toToken = destinationChain.find(
      (t) => getAddress(t.address) === getAddress(tokenOut.address),
    )
    const fromAddress = accountState.address ?? '0x0000000000000000000000000000000000000001'
    let toAddress = fromAddress
    if (
      !fromChain ||
      !toChain ||
      !fromToken ||
      !toToken ||
      !amountInput ||
      !fromAddress ||
      !toAddress
    ) {
      return null
    }
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
  $effect(() => {
    // storage
    if (!everLoaded || !tokenInput || !tokenOutput) return
    const update = {
      fromChain: tokenInput.chainId,
      fromToken: tokenInput.address,
      toToken: tokenOutput.address,
      fromAmount: amountInput,
    }
    untrack(() => {
      foreignBridgeInputs.value = update
    })
  })
  let latestQuote: RelayerQuoteResponseData['quote'] | null = $state(null)
  $effect(() => {
    const tokenOut = tokenOutput
    if (!tokenOut) return
    const latestBlockNumber = untrack(() => latestBlock.block(tokenOut.chainId))
    if (!quoteInputs || !latestBlockNumber || !latestBlockNumber.number) {
      return
    }
    const quote = getQuoteStep({
      ...quoteInputs,
      blockNumber: latestBlockNumber.number,
    })
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
  const amountOutput = $derived.by(() => {
    if (!latestQuote) return null
    return latestQuote.estimate.toAmount ? BigInt(latestQuote.estimate.toAmount) : null
  })
  const estimatedAmount = $derived.by(() => {
    if (!quoteMatchesLatest || !tokenOutput) return ''
    const formatted = formatUnits(BigInt(latestQuote!.estimate.toAmount), tokenOutput.decimals)
    const [i, d] = formatted.split('.')
    return `${i}.${d.slice(0, 9)}`
  })
  const tokenOutWithPrefixedName = $derived.by(() => {
    if (!tokenOutput) return null
    return {
      ...tokenOutput,
      name: estimatedAmount ? `${estimatedAmount} ${tokenOutput.symbol}` : tokenOutput.symbol,
    }
  })
  const getForeignBridgeApproval = $derived(
    !tokenInput
      ? _.noop
      : transactionButtonPress({
          toast,
          chainId: Number(tokenInput!.chainId),
          steps: [
            async () => {
              const token = tokenInput!
              return await transactions.checkAndRaiseApproval({
                token: token.address! as Hex,
                spender: latestQuote!.transactionRequest!.to as Hex,
                chainId: Number(token.chainId),
                minimum: amountInput,
              })
            },
          ],
        }),
  )
  const sendForeignBridgeCrossTransaction = $derived(
    !tokenInput
      ? _.noop
      : transactionButtonPress({
          toast,
          chainId: Number(tokenInput!.chainId),
          steps: [
            async () => {
              const token = tokenInput!
              const tx = await transactions.sendTransaction({
                chainId: Number(token.chainId),
                account: accountState.address,
                data: latestQuote!.transactionRequest!.data as Hex,
                gas: BigInt(latestQuote!.transactionRequest!.gasLimit ?? 0),
                gasPrice: BigInt(latestQuote!.transactionRequest!.gasPrice ?? 0),
                to: latestQuote!.transactionRequest!.to as Hex,
                value: BigInt(latestQuote!.transactionRequest!.value ?? 0),
              })
              return tx
            },
          ],
        }),
  )
  const needsAllowance = $derived.by(() => {
    const pushValue = latestQuote?.transactionRequest?.value
    if (pushValue && BigInt(pushValue) > 0n) {
      return false
    }
    return true
  })
  let allowance = $state(null as bigint | null)
  $effect(() => {
    const token = tokenInput
    if (!token) return
    const spender = latestQuote?.transactionRequest?.to
    const tokenAddress = token.address
    const account = accountState.address
    const chainId = token.chainId
    if (!tokenAddress || !needsAllowance || !account || !spender || !chainId) {
      return
    }
    const result = transactions.loadAllowance({
      token: tokenAddress as Hex,
      spender: spender as Hex,
      chainId: Number(chainId),
      account,
    })
    result.promise.then((a) => {
      if (result.controller.signal.aborted) return
      allowance = a
    })
    return result.cleanup
  })
  const crossForeignBridge = $derived.by(() => {
    if (needsAllowance) {
      if (!allowance || allowance < amountInput) {
        return getForeignBridgeApproval
      }
    }
    return sendForeignBridgeCrossTransaction
  })
  const canBridge = $derived.by(() => {
    return (
      quoteMatchesLatest &&
      !!latestQuote &&
      !!amountOutput &&
      !!amountInput &&
      !!accountState.address
    )
  })
  $inspect(needsAllowance, canBridge)
  const requiredChain = $derived.by(() => {
    const token = tokenInput
    if (!token) return null
    return availableChains.get(token.chainId)! as LIFIChain
  })
</script>

<InputOutputForm
  icon="material-symbols:captive-portal"
  ondividerclick={tokenInput && tokenOutput && tokenInput.chainId === tokenOutput.chainId
    ? () => {
        const futureInput = tokenOutput
        tokenOutput = tokenInput
        tokenInput = futureInput
        amountInput = 0n
      }
    : null}>
  {#snippet input()}
    <SectionInput
      showRadio
      label="Input"
      focused
      token={tokenInput}
      value={amountInput}
      onbalanceupdate={(balance) => {
        maxBridgeable = balance
      }}
      onmax={(balance) => {
        amountInput = balance
      }}
      oninput={(v) => {
        amountInput = v
      }}>
      {#snippet radio()}
        <OnboardRadio />
      {/snippet}
      {#snippet modal({ close })}
        <TokenAndNetworkSelector
          chainId={Number(tokenInput?.chainId ?? 1)}
          selectedToken={tokenInput}
          onsubmit={(token) => {
            if (token) {
              tokenInput = token
            }
            close()
          }} />
      {/snippet}
    </SectionInput>
  {/snippet}
  {#snippet output()}
    <SectionInput
      label="Output"
      token={tokenOutWithPrefixedName}
      value={amountOutput}
      readonlyInput
      onbalanceupdate={() => {}}>
      {#snippet modal({ close })}
        <TokenSelect
          chains={[Number(Chains.ETH)]}
          selectedChain={Number(tokenOutput?.chainId ?? 1)}
          selectedToken={tokenOutput}
          tokens={availableTokensPerOriginChain.get(1)!}
          onsubmit={(tkn) => {
            if (tkn) {
              tokenOutput = tkn
            }
            close()
          }} />
      {/snippet}
    </SectionInput>
  {/snippet}
  {#snippet button()}
    <OnboardButton
      disabled={!canBridge}
      {requiredChain}
      onclick={crossForeignBridge}
      text={needsAllowance ? 'Approve' : 'Swap'}
      loadingKey="lifi-cross-chain-swap" />
  {/snippet}
</InputOutputForm>

{#if showTooltips.value}
  <div class="absolute top-0 left-0 w-full h-full">
    <GuideShield show={true} />
    <GuideStep step={1} triggerClass="absolute top-9 right-5">
      <p>Select the token and network you want to move from.</p>
    </GuideStep>
    <GuideStep step={2} triggerClass="absolute top-24 left-5">
      <p>Set an amount to bridge.</p>
    </GuideStep>
    <GuideStep step={3} triggerClass="absolute top-1/2 right-5">
      <p>Select output token on Ethereum.</p>
    </GuideStep>
    <GuideStep step={4} triggerClass="absolute left-0 right-0 mx-auto bottom-5">
      <p>Initiate cross chain swap to Ethereum.</p>
    </GuideStep>
  </div>
{/if}

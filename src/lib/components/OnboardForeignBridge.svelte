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
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { foreignBridgeInputs } from '$lib/stores/storage.svelte'
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

  const toast = getContext('toast') as ToastContext
  let tokenInput: Token = $state({
    logoURI: `https://gib.show/image/1/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`,
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    chainId: 1,
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' as string,
  })
  let tokenOutput: Token = $state({
    logoURI: `https://gib.show/image/1/${zeroAddress}`,
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    chainId: 1,
    address: zeroAddress,
  })
  $effect(() => {
    bridgeSettings.assetIn.value = tokenOutput
  })
  let amountInput = $state(0n)
  let maxBridgeable = $state(0n as bigint | null)
  $effect(() => {
    if (maxBridgeable && amountInput > maxBridgeable) {
      amountInput = maxBridgeable
    }
  })

  let everLoaded = $state(false)
  $effect(() => {
    if (everLoaded) return
    loadData().then(async () => {
      const previousSettings = untrack(() => foreignBridgeInputs.value)
      const loadedFromChain = untrack(
        () => availableChains.get(previousSettings?.fromChain ?? 137)!,
      )
      await loadTokensForChains(loadedFromChain)
      const tokens = untrack(() => availableTokensPerOriginChain.get(loadedFromChain.id)!)
      const target =
        (previousSettings?.fromToken
          ? tokens.find((tkn) => tkn.address === previousSettings.fromToken)
          : tokens[0]) ?? tokens[0]
      if (target) {
        tokenInput = target
      }
      amountInput = previousSettings?.fromAmount ? BigInt(previousSettings.fromAmount) : 0n
      const tokensDestination = untrack(() => availableTokensPerOriginChain.get(1)!)
      const tokenDestination = previousSettings?.toToken
        ? tokensDestination.find(
            (tkn) => getAddress(tkn.address) === getAddress(previousSettings.toToken),
          )
        : tokensDestination[0]
      if (tokenDestination) {
        tokenOutput = tokenDestination
      }
      everLoaded = true
    })
  })
  const quoteInputs = $derived.by(() => {
    const fromChain = availableChains.get(tokenInput.chainId)
    const toChain = availableChains.get(tokenOutput.chainId)
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
      (t) => getAddress(t.address) === getAddress(tokenInput.address),
    )
    const toToken = destinationChain.find(
      (t) => getAddress(t.address) === getAddress(tokenOutput.address),
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
      // console.log(
      //   'no quote inputs',
      //   fromChain,
      //   toChain,
      //   fromToken,
      //   toToken,
      //   amountInput,
      //   fromAddress,
      //   toAddress,
      //   tokenInput.address,
      //   tokenOutput.address,
      // )
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
    if (!everLoaded) return
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
    const latestBlockNumber = untrack(() => latestBlock.block(tokenOutput.chainId))
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
    if (!quoteMatchesLatest) return ''
    const formatted = formatUnits(BigInt(latestQuote!.estimate.toAmount), tokenOutput.decimals)
    const [i, d] = formatted.split('.')
    return `${i}.${d.slice(0, 9)}`
  })
  const tokenOutWithPrefixedName = $derived.by(() => ({
    ...tokenOutput,
    name: estimatedAmount ? `${estimatedAmount} ${tokenOutput.symbol}` : tokenOutput.symbol,
  }))
  const crossForeignBridge = transactionButtonPress({
    toast,
    steps: [
      async () => {
        // console.log('checking approval')
        return await transactions.checkAndRaiseApproval({
          token: tokenInput!.address! as Hex,
          spender: latestQuote!.transactionRequest!.to as Hex,
          chainId: Number(tokenInput.chainId),
          minimum: amountInput,
        })
      },
      async () => {
        const tx = await transactions.sendTransaction({
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
  const requiredChain = $derived.by(() => {
    return availableChains.get(tokenInput.chainId)! as LIFIChain
  })
</script>

<InputOutputForm
  icon="material-symbols:captive-portal"
  ondividerclick={tokenInput.chainId === tokenOutput.chainId
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
          chainId={Number(tokenInput.chainId)}
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
      text="Bridge to Ethereum"
      loadingKey="lifi-quote" />
  {/snippet}
</InputOutputForm>

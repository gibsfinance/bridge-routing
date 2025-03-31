<script lang="ts">
  import TokenSelect from './TokenSelect.svelte'
  import * as transactions from '$lib/stores/transactions'
  import { formatUnits, getAddress, maxUint256, zeroAddress, type Hex } from 'viem'
  import type { Token } from '$lib/types.svelte'
  import {
    availableChains,
    availableTokensPerOriginChain,
    loadData,
    loadTokensForChains,
  } from '$lib/stores/lifi.svelte'
  import { settings as bridgeAdminSettings, settingKey } from '$lib/stores/fee-manager.svelte'
  import {
    accountState,
    connect,
    getNetwork,
    switchNetwork,
  } from '$lib/stores/auth/AuthProvider.svelte'
  import { ChainType } from '@lifi/types'
  import _ from 'lodash'
  import {
    activeOnboardStep,
    foreignBridgeInputs,
    bridgeTx,
    showTooltips,
    defaultOnboardTokens,
  } from '$lib/stores/storage.svelte'
  import { untrack } from 'svelte'
  import {
    assetLink,
    blocks,
    fetchMinBridgeAmountIn,
    loadAssetLink,
    minBridgeAmountIn,
    minBridgeAmountInKey,
  } from '$lib/stores/chain-events.svelte'
  import SectionInput from './SectionInput.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import OnboardButton from './OnboardButton.svelte'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
  import GuideStep from './GuideStep.svelte'
  import GuideShield from './GuideShield.svelte'
  import {
    assetOutKey,
    bridgeSettings,
    searchKnownAddresses,
  } from '$lib/stores/bridge-settings.svelte'
  import {
    amountIn,
    bridgableTokens,
    bridgeKey,
    loadFeeFor,
    oneEther,
    recipient,
  } from '$lib/stores/input.svelte'
  import { getPulseXQuote } from '$lib/stores/pulsex/quote.svelte'
  import type { SerializedTrade } from '$lib/stores/pulsex/transformers'
  import { getTransactionDataFromTrade } from '$lib/stores/pulsex/serialize'
  import BridgeProgress from './BridgeProgress.svelte'
  import Onramps from './Onramps.svelte'

  const toast = getContext('toast') as ToastContext

  const defaultPulsexTokens = {
    bridgeTokenIn: zeroAddress,
    bridgeTokenOut: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
    pulsexTokenIn: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
    pulsexTokenOut: zeroAddress,
  } as const
  const defaultTokenAddresses = $derived({
    ...defaultPulsexTokens,
    ...(defaultOnboardTokens.value ?? {}),
  })
  const bridgeableTokensSettings = {
    provider: Provider.PULSECHAIN,
    chain: Number(Chains.ETH),
    partnerChain: Number(Chains.PLS),
  }
  const possibleBridgeTokenInputs = $derived(
    bridgableTokens.bridgeableTokensUnder(bridgeableTokensSettings),
  )
  const possiblePulsexTokens = $derived(
    bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(Chains.PLS),
      partnerChain: null,
    }),
  )
  let tokenInputLifi = $state<Token | null>(null)
  let tokenOutputLifi = $state<Token | null>(null)
  let amountInputFromLifi = $state(0n)
  let maxCrossToEthereumBridge = $state(0n as bigint | null)
  const destinationAddress = $derived.by(() => foreignBridgeInputs.value?.toAddress ?? null)
  $effect(() => {
    if (maxCrossToEthereumBridge && amountInputFromLifi > maxCrossToEthereumBridge) {
      amountInputFromLifi = maxCrossToEthereumBridge
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
      amountInputFromLifi = previousSettings?.fromAmount ? BigInt(previousSettings.fromAmount) : 0n
      const tokensDestination = untrack(() => availableTokensPerOriginChain.get(1)!)
      const tokensOrigin = untrack(
        () => availableTokensPerOriginChain.get(previousSettings?.fromChain ?? 1)!,
      )
      const tokenOrigin = !previousSettings?.fromToken
        ? tokensOrigin[0]
        : tokensOrigin.find(
            (tkn) => tkn.address.toLowerCase() === previousSettings.fromToken.toLowerCase(),
          )
      if (tokenOrigin) {
        tokenInputLifi = tokenOrigin
      }
      const tokenDestination = !previousSettings?.toToken
        ? tokensDestination[0]
        : tokensDestination.find(
            (tkn) => tkn.address.toLowerCase() === previousSettings.toToken.toLowerCase(),
          )
      if (tokenDestination) {
        tokenOutputLifi = tokenDestination
      }
      everLoaded = true
    })
    return () => {
      cancelled = true
    }
  })
  const buttonEnabled = $derived.by(() => {
    if (bridgingToPulsechain) {
      const minAmountIn = minBridgeAmountIn.get(minBridgeAmountKey)
      return (
        !maxCrossPulsechainBridge ||
        !amountIn.value ||
        !minAmountIn ||
        amountIn.value < minAmountIn ||
        amountIn.value > maxCrossPulsechainBridge
      )
    }
    return !swapDisabled && pulsexQuoteMatchesLatest
  })
  // let crossingTokenInput: Token | null = $state(null)
  // const bridgeTokenOutAddress = $derived.by(() => {
  //   return crossingTokenInput?.extensions?.bridgeInfo?.[Number(Chains.PLS)]?.tokenAddress
  // })
  // const crossingTokenInput = $derived.by(() => {
  //   return defaultTokenAddresses.bridgeTokenIn ?? null
  // })
  $effect(() => {
    if (!defaultTokenAddresses.bridgeTokenIn) return
    const settingsMatch =
      bridgeKey.provider === Provider.PULSECHAIN &&
      bridgeKey.fromChain === Chains.ETH &&
      bridgeKey.toChain === Chains.PLS
    if (!settingsMatch) {
      bridgeKey.value = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS]
    }
    bridgeKey.assetInAddress = defaultTokenAddresses.bridgeTokenIn
  })
  const bridgeTokenIn = $derived.by(() => {
    return (
      possibleBridgeTokenInputs.find((t) => t.address === defaultTokenAddresses.bridgeTokenIn) ??
      null
    )
  })
  $effect(() => {
    if (possibleBridgeTokenInputs.length === 0 || !bridgeTokenIn) {
      return
    }
    untrack(() => {
      bridgeSettings.assetIn.value = bridgeTokenIn
    })
  })
  const bridgeTokenOut = $derived.by(() => {
    return (
      possiblePulsexTokens.find((t) => t.address === defaultTokenAddresses.bridgeTokenOut) ?? null
    )
  })
  const finalTokenOutput = $derived.by(() => {
    return (
      possiblePulsexTokens.find((t) => t.address === defaultTokenAddresses.pulsexTokenOut) ?? null
    )
  })
  // const bridgingToEthereum = $derived(activeOnboardStep.value === 1)
  const bridgingToPulsechain = $derived(activeOnboardStep.value === 1)
  const swappingOnPulsex = $derived(activeOnboardStep.value === 2)

  const bridgeAmount = $derived(amountIn.value ?? 0n)
  const bridgeFeePercent = $derived(
    bridgeAdminSettings.get(settingKey(bridgeKey.value))?.feeF2H ?? 0n,
  )
  const bridgeFeeAmount = $derived((bridgeFeePercent * bridgeAmount) / oneEther)
  const amountOutputFromBridge = $derived(bridgeAmount - bridgeFeeAmount)
  let amountInputToPulsex = $state(0n)
  $effect(() => {
    if (!bridgeTokenIn || !bridgeTokenIn.address) return
    const assetOutputKey = assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: bridgeTokenIn.address as Hex,
      unwrap: false,
    })
    if (!assetOutputKey) return
    const tokensUnderBridgeKey = bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(bridgeKey.toChain),
      partnerChain: Number(bridgeKey.fromChain),
    })
    const link = loadAssetLink({
      bridgeKey: bridgeKey.value,
      assetIn: bridgeTokenIn,
    })
    link.promise.then((l) => {
      if (link.controller.signal.aborted || !l?.assetOutAddress) return
      // reverse the chains here because we are looking for the destination
      const assetOut = searchKnownAddresses({
        tokensUnderBridgeKey,
        address: l?.assetOutAddress,
        customTokens: [],
      })
      assetLink.value = l
      if (!assetOut) return
      bridgeSettings.setAssetOut(assetOutputKey, {
        ...assetOut,
        logoURI: bridgeSettings.assetIn.value?.logoURI,
      })
      defaultOnboardTokens.extend({
        bridgeTokenOut: assetOut.address as Hex,
        pulsexTokenIn: assetOut.address as Hex,
      })
    })
    return link.cleanup
  })
  $effect(() => {
    const pathway = bridgeKey.pathway
    if (!pathway) return
    const result = loadFeeFor({
      value: bridgeKey.value,
      pathway,
      fromChain: Number(bridgeKey.fromChain),
      toChain: Number(bridgeKey.toChain),
    })
    return result.cleanup
  })
  $effect(() => {
    recipient.value = (accountState.address ?? zeroAddress) as Hex
  })
  const incrementApprovalToPulsechain = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(bridgeKey.fromChain),
      steps: [
        async () => {
          if (!accountState.address) return
          return await transactions.checkAndRaiseApproval({
            token: bridgeSettings.assetIn.value!.address! as Hex,
            spender: bridgeSettings.bridgePathway!.from!,
            chainId: Number(bridgeKey.fromChain),
            minimum: bridgeAmount,
            latestBlock: blocks.get(Number(bridgeKey.fromChain))!,
          })
        },
      ],
    }),
  )
  const initiateBridgeToPulsechain = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(bridgeKey.fromChain),
      steps: [
        async () => {
          const tx = await transactions.sendTransaction({
            account: accountState.address as Hex,
            chainId: Number(bridgeKey.fromChain),
            ...bridgeSettings.transactionInputs,
          })
          bridgeTx.extend({
            hash: tx,
          })
          return tx
        },
      ],
    }),
  )
  const originationTicker = $derived(blocks.get(Number(bridgeKey.fromChain)))
  const bridgeApproval = $derived(bridgeSettings.approval.value)
  const needsAllowanceForPulsechainBridge = $derived(
    bridgeApproval !== null && bridgeApproval < bridgeSettings.amountToBridge,
  )
  // bridgeSettings.assetIn.value = defaultTokenAddresses.bridgeTokenIn ?? {
  //   address: zeroAddress,
  //   chainId: Number(bridgeKey.fromChain),
  //   decimals: 18,
  //   symbol: 'ETH',
  //   name: 'Ether',
  // }
  $effect(() => {
    const account = accountState.address
    const token = bridgeSettings.assetIn.value?.address
    const bridgePath = bridgeKey.pathway?.from
    if (token === zeroAddress) {
      if (bridgeApproval !== maxUint256) {
        bridgeSettings.approval.value = maxUint256
      }
      return
    }
    if (
      !account ||
      !bridgePath ||
      !token ||
      !bridgeKey.fromChain ||
      !originationTicker ||
      !assetLink.value ||
      assetLink.value.assetInAddress !== token ||
      Number(bridgeKey.fromChain) !== bridgeSettings.assetIn.value?.chainId
    ) {
      return
    }
    const result = transactions.loadAllowance({
      account: account as Hex,
      token: token as Hex,
      spender: bridgePath,
      chainId: Number(bridgeKey.fromChain),
    })
    result.promise.then((approval) => {
      if (result.controller.signal.aborted) return
      bridgeSettings.approval.value = approval ?? 0n
    })
    return result.cleanup
  })
  const approvalIsLoading = $derived(bridgeSettings.approval.value === null)
  const approvalIsTooLow = $derived(
    bridgeSettings.approval.value && bridgeSettings.approval.value < bridgeSettings.amountToBridge,
  )
  const pulsechainBridgeNeedsApproval = $derived.by(() => {
    return (
      assetLink.value?.originationChainId === bridgeKey.fromChain &&
      (approvalIsLoading || approvalIsTooLow)
    )
  })
  let maxCrossPulsechainBridge = $state(0n as bigint | null)
  $effect(() => fetchMinBridgeAmountIn(bridgeKey.value, bridgeSettings.assetIn.value))
  const minBridgeAmountKey = $derived(
    minBridgeAmountInKey(bridgeKey.value, bridgeSettings.assetIn.value),
  )
  const findToken = (address: Hex) => {
    return possiblePulsexTokens.find((t) => getAddress(t.address) === getAddress(address))
  }
  const tokenInPulsex = $derived.by(() => {
    return findToken(defaultTokenAddresses.pulsexTokenIn) ?? null
  })
  const tokenOutPulsex = $derived.by(() => {
    return findToken(defaultTokenAddresses.pulsexTokenOut) ?? null
  })
  const tokenOut = $derived.by(() => {
    return findToken(defaultTokenAddresses.bridgeTokenOut) ?? null
  })
  let pulsexQuoteResult = $state<SerializedTrade | null>(null)
  const latestPulseBlock = $derived(blocks.get(Number(Chains.PLS)))
  $effect(() => {
    if (
      !tokenInPulsex ||
      !tokenOutPulsex ||
      !amountInputToPulsex ||
      !latestPulseBlock ||
      !swappingOnPulsex
    ) {
      // console.log(
      //   'swapping on pulsex',
      //   !tokenInPulsex,
      //   !tokenOut,
      //   !amountInputToPulsex,
      //   !latestPulseBlock,
      //   !swappingOnPulsex,
      // )
      return
    }
    // console.log('getting pulsex quote', tokenInPulsex, tokenOutPulsex)
    const quote = getPulseXQuote({
      tokenIn: tokenInPulsex,
      tokenOut: tokenOutPulsex,
      amountIn: amountInputToPulsex,
      amountOut: null,
    })
    quote.promise.then((result) => {
      if (quote.controller.signal.aborted || !result) return
      // console.log('pulsex quote result', result)
      pulsexQuoteResult = result
    })
    return quote.cleanup
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
  const amountOutputFromPulsex = $derived.by(() => {
    if (!pulsexQuoteResult || !tokenOut) return null
    return truncateValue(pulsexQuoteResult.outputAmount.value, tokenOut.decimals)
  })
  // $inspect(pulsexQuoteResult?.outputAmount, amountOutputFromPulsex)
  const pulsexQuoteMatchesLatest = $derived.by(() => {
    if (!pulsexQuoteResult || !amountInputToPulsex) return false
    return pulsexQuoteResult.inputAmount.value === amountInputToPulsex.toString()
  })
  const swapRouterAddress = '0xDA9aBA4eACF54E0273f56dfFee6B8F1e20B23Bba'
  const swapDisabled = $derived(
    !pulsexQuoteResult || !amountInputToPulsex || !amountOutputFromPulsex,
  )
  let pulsexAllowance = $state<bigint | null>(null)
  $effect.pre(() => {
    if (!tokenInPulsex || !accountState.address || !latestPulseBlock || !swappingOnPulsex) return
    const result = transactions.loadAllowance({
      account: accountState.address as Hex,
      token: tokenInPulsex.address as Hex,
      spender: swapRouterAddress,
      chainId: Number(Chains.PLS),
    })
    result.promise.then((res) => {
      if (result.controller.signal.aborted) return
      pulsexAllowance = res ?? 0n
    })
    return result.cleanup
  })
  const needsAllowanceForPulsex = $derived.by(() => {
    return (
      tokenInPulsex?.address !== zeroAddress &&
      amountInputToPulsex !== null &&
      (!pulsexAllowance || pulsexAllowance < amountInputToPulsex)
    )
  })
  const incrementPulsexAllowance = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(Chains.PLS),
      steps: [
        async () => {
          if (swapDisabled) return
          return await transactions.checkAndRaiseApproval({
            token: tokenInPulsex!.address! as Hex,
            spender: swapRouterAddress,
            chainId: Number(Chains.PLS),
            minimum: amountInputToPulsex!,
            latestBlock: latestPulseBlock!,
          })
        },
      ],
    }),
  )
  const swapTokensOnPulsex = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(Chains.PLS),
      steps: [
        async () => {
          const transactionInfo = getTransactionDataFromTrade(
            Number(Chains.PLS),
            pulsexQuoteResult!,
          )
          const tx = await transactions.sendTransaction({
            data: transactionInfo.calldata as Hex,
            to: swapRouterAddress,
            gas: BigInt(pulsexQuoteResult!.gasEstimate!),
            value: BigInt(transactionInfo.value),
            chainId: Number(Chains.PLS),
            maxFeePerGas: latestPulseBlock!.baseFeePerGas! * 2n,
            maxPriorityFeePerGas: latestPulseBlock!.baseFeePerGas! / 5n,
          })
          return tx
        },
      ],
    }),
  )
  const bridgeTokensToPulsechainStep = $derived.by(() => {
    if (pulsechainBridgeNeedsApproval) {
      return incrementApprovalToPulsechain
    }
    return initiateBridgeToPulsechain
  })
  const swapPulsexStep = $derived.by(() => {
    if (needsAllowanceForPulsex) {
      return incrementPulsexAllowance
    }
    return swapTokensOnPulsex
  })
  const onButtonClick = $derived.by(() => {
    if (!accountState.address) {
      return connect
    }
    if (bridgingToPulsechain) {
      return bridgeTokensToPulsechainStep
    }
    return swapPulsexStep
  })
  const requiredChain = $derived.by(() => {
    const chainId = activeOnboardStep.value === 1 ? Chains.ETH : Chains.PLS
    const chain = availableChains.get(Number(chainId))!
    if (!chain) {
      const chain = getNetwork({
        chainId: Number(chainId),
        name: '',
      })
      if (chain) {
        return {
          id: chain.id,
          name: chain.name,
          chainType: ChainType.EVM,
        }
      }
      return null
    }
    return {
      id: chain.id,
      name: chain.name,
      chainType: ChainType.EVM,
    }
  })
  const buttonText = $derived.by(() => {
    if (activeOnboardStep.value === 1) {
      if (needsAllowanceForPulsechainBridge) {
        return 'Approve'
      }
      return 'Bridge'
    }
    if (needsAllowanceForPulsex) {
      return 'Approve'
    }
    return 'Swap'
  })
  const loadingKey = $derived.by(() => {
    if (activeOnboardStep.value === 1) {
      return 'bridge-to-pulsechain'
    }
    return pulsexQuoteResult ? 'pulsex-quote' : ''
  })
</script>

<Onramps />
<SectionInput
  label="Bridge to Pulsechain"
  focused={bridgingToPulsechain}
  token={bridgeTokenIn}
  value={amountIn.value}
  compressed={!bridgingToPulsechain}
  dashWhenCompressed={swappingOnPulsex}
  readonlyInput={!bridgingToPulsechain}
  readonlyTokenSelect={!bridgingToPulsechain}
  valueLoadingKey={null}
  onclick={() => {
    if (swappingOnPulsex) {
      activeOnboardStep.value = 1
    }
  }}
  oninput={({ int }) => {
    if (int !== null) {
      amountIn.value = int
      return int
    }
  }}
  onbalanceupdate={() => {
    // set ethereum balance
  }}
  onmax={(balance) => {
    amountIn.value = balance
  }}>
  {#snippet modal({ close })}
    <TokenSelect
      chains={[Number(Chains.ETH)]}
      selectedChain={Number(Chains.ETH)}
      tokens={possibleBridgeTokenInputs}
      selectedToken={bridgeTokenIn}
      onsubmit={(token) => {
        // bridgeTokenIn = token
        if (token) {
          defaultOnboardTokens.extend({
            bridgeTokenIn: token.address as Hex,
          })
        }
        close()
      }}></TokenSelect>
  {/snippet}
</SectionInput>
{#if bridgingToPulsechain}
  <BridgeProgress
    oncomplete={() => {
      if (!bridgingToPulsechain) {
        return
      }
      activeOnboardStep.value = 2
      const chain = getNetwork({
        chainId: Number(Chains.PLS),
        name: '',
      })
      if (!chain) {
        return
      }
      switchNetwork(chain)
    }} />
{/if}
<SectionInput
  label="Swap on PulseX"
  focused={activeOnboardStep.value >= 1}
  token={bridgeTokenOut}
  value={bridgingToPulsechain ? amountOutputFromBridge : amountInputToPulsex}
  compressed={!swappingOnPulsex}
  readonlyInput={!swappingOnPulsex}
  readonlyTokenSelect
  onbalanceupdate={() => {}}
  onclick={() => {
    if (bridgingToPulsechain) {
      activeOnboardStep.value = 2
    }
  }}
  onmax={(balance) => {
    amountInputToPulsex = balance
  }}
  oninput={({ int }) => {
    if (int !== null) {
      amountInputToPulsex = int
      return int
    }
  }}>
  {#snippet modal({ close })}
    <TokenSelect
      chains={[Number(Chains.PLS)]}
      selectedChain={Number(Chains.PLS)}
      tokens={possiblePulsexTokens}
      onsubmit={(token) => {
        // set pulsechain token input
        // bridgeTokenOut = token
        close()
      }} />
  {/snippet}
</SectionInput>
<SectionInput
  label="Output"
  token={finalTokenOutput}
  value={amountOutputFromPulsex}
  focused={swappingOnPulsex}
  compressed={!swappingOnPulsex}
  dashWhenCompressed
  readonlyInput
  readonlyTokenSelect={!swappingOnPulsex}
  onbalanceupdate={() => {}}
  overrideAccount={destinationAddress}
  onclick={() => {
    if (!swappingOnPulsex) {
      activeOnboardStep.value = 2
    }
  }} />
<OnboardButton
  disabled={!buttonEnabled}
  {requiredChain}
  onclick={onButtonClick}
  text={buttonText}
  {loadingKey} />

{#if showTooltips.value}
  <div class="absolute top-0 left-0 w-full h-full">
    <GuideShield show={true} />
    {#if bridgingToPulsechain}
      <GuideStep step={1} triggerClass="absolute left-24 top-12">
        <p>Onramp funds</p>
      </GuideStep>
      <GuideStep step={2} triggerClass="absolute right-24 top-28">
        <p>Select the token you wish to bridge to PulseChain.</p>
      </GuideStep>
      <GuideStep step={3} triggerClass="absolute right-24 bottom-4">
        <p>Trigger the bridge to PulseChain.</p>
      </GuideStep>
    {:else}
      <GuideStep step={1} triggerClass="absolute right-24 top-44">
        <p>Select the token you wish to swap from.</p>
      </GuideStep>
      <GuideStep step={2} triggerClass="absolute right-24 bottom-4">
        <p>Trigger the swap on PulseX.</p>
      </GuideStep>
    {/if}
  </div>
{/if}

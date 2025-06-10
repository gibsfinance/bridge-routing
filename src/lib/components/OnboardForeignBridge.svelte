<script lang="ts">
  import TokenSelect from './TokenSelect.svelte'
  import * as transactions from '../stores/transactions'
  import { formatUnits, getAddress, maxUint256, zeroAddress, type Hex } from 'viem'
  import { settings as bridgeAdminSettings, settingKey } from '../stores/fee-manager.svelte'
  import { toChain } from '../stores/auth/types'
  import {
    accountState,
    connect,
    getNetwork,
    switchNetwork,
  } from '../stores/auth/AuthProvider.svelte'
  import _ from 'lodash'
  import {
    bridgeTx,
  } from '../stores/storage.svelte'
  import {
    assetLink,
    blocks,
    fetchMinBridgeAmountIn,
    loadAssetLink,
    minBridgeAmountIn,
    minBridgeAmountInKey,
  } from '../stores/chain-events.svelte'
  import SectionInput from './SectionInput.svelte'
  import { Chains, Provider } from '../stores/auth/types'
  import OnboardButton from './OnboardButton.svelte'
  import { transactionButtonPress } from '../stores/transaction'
  import BridgeProgressTxInputToggle from './BridgeProgressTxInputToggle.svelte'
  import {
    assetOutKey,
    bridgeSettings,
    searchKnownAddresses,
  } from '../stores/bridge-settings.svelte'
  import {
    amountIn,
    bridgableTokens,
    bridgeKey,
    loadFeeFor,
    oneEther,
    recipient,
    type BridgeKey,
  } from '../stores/input.svelte'
  import { getPulseXQuote } from '../stores/pulsex/quote.svelte'
  import type { SerializedTrade } from '../stores/pulsex/transformers'
  import { getTransactionDataFromTrade } from '../stores/pulsex/serialize'
  import BridgeProgress from './BridgeProgress.svelte'
  import Onramps from './Onramps.svelte'
  import { chainsMetadata } from '../stores/auth/constants'
  import Icon from '@iconify/svelte'
  import Button from './Button.svelte'
  import OnboardGuide from './OnboardGuide.svelte'
  import { page } from '../stores/app-page.svelte'
  import * as settings from '../stores/settings.svelte'
  import { untrack } from 'svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import type { Token } from '../types.svelte'
  import { nativeAssetOut } from '../stores/config.svelte'

  const pulsechainWrappedWethFromEthereum = '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C'
  const bridgeTokenInAddress = $derived((page.queryParams.get('bridgeTokenIn') ?? zeroAddress) as Hex)

  const bridgeableTokensSettings = {
    provider: Provider.PULSECHAIN,
    chain: Number(Chains.ETH),
    partnerChain: Number(Chains.PLS),
  }
  const possibleBridgeTokenInputs = $derived(
    bridgableTokens.bridgeableTokensUnder(bridgeableTokensSettings),
  )
  const bridgeTokenIn = $derived.by(() => {
    return (
      possibleBridgeTokenInputs.find(
        (t) => getAddress(t.address) === getAddress(bridgeTokenInAddress),
      ) ?? null
    )
  })
  const assetOuts = new SvelteMap<string, Token>()
  const assetOutputKey = $derived(bridgeTokenIn ? assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: bridgeTokenIn.address === zeroAddress ? nativeAssetOut[toChain(bridgeTokenIn.chainId)] : bridgeTokenIn.address,
      unwrap: false,
    }) : null)
  const bridgeTokenOutAddress = $derived(assetOuts.get(assetOutputKey as string)?.address ?? null)
  const pulsexTokenInAddress = $derived.by(() => {
    if (!page.queryParams.get('pulsexTokenIn')) {
      return (bridgeTokenOutAddress ?? pulsechainWrappedWethFromEthereum) as Hex
    }
    return (page.queryParams.get('pulsexTokenIn') ?? pulsechainWrappedWethFromEthereum) as Hex
  })
  const pulsexTokenOutAddress = $derived((page.queryParams.get('pulsexTokenOut') ?? zeroAddress) as Hex)

  const possiblePulsexTokens = $derived(
    bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(Chains.PLS),
      partnerChain: null,
    }),
  )
  let amountInputFromLifi = $state(0n)
  let maxCrossToEthereumBridge = $state(0n as bigint | null)
  $effect(() => {
    if (maxCrossToEthereumBridge && amountInputFromLifi > maxCrossToEthereumBridge) {
      amountInputFromLifi = maxCrossToEthereumBridge
    }
  })

  const amountLessThanMin = $derived.by(() => {
    const minAmountIn = minBridgeAmountIn.get(minBridgeAmountKey)
    if (_.isNil(minAmountIn) || _.isNil(amountIn.value) || amountIn.value === 0n) {
      return null
    }
    return amountIn.value < minAmountIn
  })
  const buttonDisabled = $derived.by(() => {
    if (bridgingToPulsechain) {
      return (
        !maxCrossPulsechainBridge ||
        !amountIn.value ||
        amountLessThanMin !== false ||
        amountIn.value > maxCrossPulsechainBridge
      )
    }
    if (needsAllowanceForPulsex) {
      return !pulsexTokenIn?.address || !loadingKey
    }
    return swapDisabled || !pulsexQuoteMatchesLatest || !loadingKey
  })
  $effect(() => {
    if (!bridgeTokenIn) return
    const settingsMatch =
      bridgeKey.provider === Provider.PULSECHAIN &&
      bridgeKey.fromChain === Chains.ETH &&
      bridgeKey.toChain === Chains.PLS
    if (!settingsMatch) {
      bridgeKey.value = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS]
    }
    bridgeKey.assetInAddress = bridgeTokenInAddress
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
    return bridgeTokenOutAddress ? (
      possiblePulsexTokens.find(
        (t) => getAddress(t.address) === getAddress(bridgeTokenOutAddress),
      ) ?? null
    ) : null
  })
  const pulsexTokenIn = $derived.by(() => {
    return (
      possiblePulsexTokens.find(
        (t) => getAddress(t.address) === getAddress(pulsexTokenInAddress),
      ) ?? null
    )
  })
  const finalTokenOutput = $derived.by(() => {
    return (
      possiblePulsexTokens.find(
        (t) => getAddress(t.address) === getAddress(pulsexTokenOutAddress),
      ) ?? null
    )
  })
  const stage = $derived(page.stage ?? settings.stage.ONBOARD)
  const bridgingToPulsechain = $derived(stage === settings.stage.ONBOARD)
  const swappingOnPulsex = $derived(stage === settings.stage.SWAP)

  const bridgeAmount = $derived(amountIn.value ?? 0n)
  const bridgeFeePercent = $derived(
    bridgeAdminSettings.get(settingKey(bridgeKey.value))?.feeF2H ?? 0n,
  )
  const bridgeFeeAmount = $derived((bridgeFeePercent * bridgeAmount) / oneEther)
  const amountOutputFromBridge = $derived(bridgeAmount - bridgeFeeAmount)
  let amountInputToPulsex = $state(0n)
  $effect(() => {
    if (!bridgeTokenIn || !bridgeTokenIn.address) return
    if (!assetOutputKey) {
      return
    }
    const bridgeTokenInWithCorrectAddress = {
      ...bridgeTokenIn,
      address: bridgeTokenIn.address === zeroAddress ? nativeAssetOut[toChain(bridgeTokenIn.chainId)] : bridgeTokenIn.address,
    }
    const tokensUnderReversedBridgeKey = bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(bridgeKey.toChain),
      partnerChain: Number(bridgeKey.fromChain),
    })
    const link = loadAssetLink({
      bridgeKey: bridgeKey.value,
      assetIn: bridgeTokenInWithCorrectAddress,
    })
    link.promise.then((l) => {
      if (link.controller.signal.aborted || !l?.assetOutAddress) return
      // reverse the chains here because we are looking for the destination
      const assetOut = searchKnownAddresses({
        tokensUnderBridgeKey: tokensUnderReversedBridgeKey,
        address: l?.assetOutAddress,
        customTokens: [],
      })
      assetLink.value = l
      if (!assetOut) return
      assetOuts.set(assetOutputKey as string, {
        ...assetOut,
        logoURI: bridgeSettings.assetIn.value?.logoURI ?? null,
      })
      page.setParams({
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
      chainId: Number(bridgeKey.fromChain),
      steps: [
        async () => {
          if (!accountState.address) return
          return await transactions.checkAndRaiseApproval({
            token: bridgeSettings.assetIn.value!.address! as Hex,
            spender: bridgeSettings.bridgePathway!.from!,
            chainId: Number(bridgeKey.fromChain),
            minimum: bridgeAmount,
            latestBlock: blocks.get(Number(bridgeKey.fromChain))!.get('latest')!.block!,
          })
        },
      ],
    }),
  )
  const initiateBridgeToPulsechain = $derived.by(() => {
    let amountInBefore = ''
    return transactionButtonPress({
      chainId: Number(bridgeKey.fromChain),
      steps: [
        async () => {
          const tx = await transactions.sendTransaction({
            ...transactions.options(
              Number(bridgeKey.fromChain),
              blocks.get(Number(bridgeKey.fromChain))!.get('latest')!.block!,
            ),
            account: accountState.address as Hex,
            ...bridgeSettings.transactionInputs,
          })
          amountInBefore = formatUnits(bridgeSettings.amountToBridge!, bridgeTokenIn!.decimals)
          bridgeTx.extend({
            hash: tx,
            bridgeKey: bridgeKey.value.slice(0) as BridgeKey,
          })
          return tx
        },
      ],
      after: () => {
        const previousAmount = formatUnits(bridgeSettings.amountToBridge!, bridgeTokenIn!.decimals)
        if (amountInBefore === previousAmount) {
          amountIn.value = null
        }
      },
    })
  })
  const originationTicker = $derived(blocks.get(Number(bridgeKey.fromChain)))
  const bridgeApproval = $derived(bridgeSettings.approval.value)
  const needsAllowanceForPulsechainBridge = $derived(
    bridgeApproval !== null && bridgeApproval < bridgeSettings.amountToBridge,
  )
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
    bridgeSettings.approval.value !== null && bridgeSettings.approval.value < bridgeSettings.amountToBridge,
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
    return !address ? null : possiblePulsexTokens.find((t) => getAddress(t.address) === getAddress(address)) ?? null
  }
  const tokenInPulsex = $derived.by(() => {
    return findToken(pulsexTokenInAddress)
  })
  const tokenOutPulsex = $derived.by(() => {
    return findToken(pulsexTokenOutAddress)
  })
  const tokenOut = $derived.by(() => {
    return bridgeTokenOutAddress ? findToken(bridgeTokenOutAddress as Hex) : null
  })
  let pulsexQuoteResult = $state<SerializedTrade | null>(null)
  const latestPulseBlock = $derived(blocks.get(Number(Chains.PLS))!.get('latest')!.block!)
  let lastUpdatedWasOutput = $state(false)
  const wplsTokenInAddress = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27'
  const plsxTokenAddress = '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab'
  $effect(() => {
    if (!tokenInPulsex || !tokenOutPulsex) return
    const tokenInAddress = tokenInPulsex.address.toLowerCase()
    const tokenOutAddress = tokenOutPulsex.address.toLowerCase()
    const nativeWrapped = nativeAssetOut[Chains.PLS].toLowerCase()
    const normalizedIn = tokenInAddress === nativeWrapped ? zeroAddress : tokenInAddress
    const normalizedOut = tokenOutAddress === nativeWrapped ? zeroAddress : tokenOutAddress
    if (normalizedIn !== normalizedOut) return
    const targetAddress = normalizedIn === zeroAddress ? plsxTokenAddress : wplsTokenInAddress
    // set output to pulsex token
    pulsexQuoteResult = null
    amountIn.value = null
    amountInputToPulsex = 0n
    if (lastUpdatedWasOutput) {
      page.setParam('pulsexTokenIn', targetAddress)
    } else {
      page.setParam('pulsexTokenOut', targetAddress)
    }
  })
  $effect(() => {
    if (
      !tokenInPulsex ||
      !tokenOutPulsex ||
      !amountInputToPulsex ||
      !latestPulseBlock ||
      !swappingOnPulsex ||
      tokenInPulsex.address.toLowerCase() === tokenOutPulsex.address.toLowerCase()
    ) {
      return
    }
    const quote = getPulseXQuote({
      tokenIn: tokenInPulsex,
      tokenOut: tokenOutPulsex,
      amountIn: amountInputToPulsex,
      amountOut: null,
    })
    quote.promise.then((result) => {
      if (quote.controller.signal.aborted || !result) return
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
  const pulsexQuoteMatchesLatest = $derived.by(() => {
    if (!pulsexQuoteResult || !amountInputToPulsex) return false
    return pulsexQuoteResult.inputAmount.value === amountInputToPulsex.toString()
  })
  const swapRouterAddress = '0xDA9aBA4eACF54E0273f56dfFee6B8F1e20B23Bba'
  const swapDisabled = $derived(
    !pulsexQuoteResult || !amountInputToPulsex || !amountOutputFromPulsex,
  )
  let pulsexAllowance = $state<bigint | null>(null)
  $effect(() => {
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
      chainId: Number(Chains.PLS),
      steps: [
        async () => {
          return await transactions.checkAndRaiseApproval({
            token: tokenInPulsex!.address! as Hex,
            spender: swapRouterAddress,
            chainId: Number(Chains.PLS),
            minimum: amountInputToPulsex!,
            latestBlock: latestPulseBlock,
          })
        },
      ],
    }),
  )
  const swapTokensOnPulsex = $derived(
    transactionButtonPress({
      chainId: Number(Chains.PLS),
      steps: [
        async () => {
          const transactionInfo = getTransactionDataFromTrade(
            Number(Chains.PLS),
            pulsexQuoteResult!,
          )
          const tx = await transactions.sendTransaction({
            ...transactions.options(Number(Chains.PLS), latestPulseBlock),
            data: transactionInfo.calldata as Hex,
            to: swapRouterAddress,
            gas: BigInt(pulsexQuoteResult!.gasEstimate!) * 5n / 4n,
            value: BigInt(transactionInfo.value),
            account: accountState.address as Hex,
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
    const chainId = stage === settings.stage.ONBOARD ? Chains.ETH : Chains.PLS
    const chain = chainsMetadata[chainId]
    return {
      id: chain.id,
      name: chain.name,
    }
  })
  const buttonText = $derived.by(() => {
    if (stage === settings.stage.ONBOARD) {
      if (needsAllowanceForPulsechainBridge) {
        return `Approve${bridgeTokenIn?.symbol ? ` ${bridgeTokenIn.symbol}` : ''} to Pulsechain`
      }
      return `Bridge${bridgeTokenIn?.symbol ? ` ${bridgeTokenIn.symbol}` : ''} to Pulsechain`
    }
    if (needsAllowanceForPulsex) {
      return `Approve${tokenInPulsex?.symbol ? ` ${tokenInPulsex.symbol}` : ''} for PulseX`
    }
    if (tokenInPulsex && tokenOutPulsex) {
      return `Swap${tokenInPulsex?.symbol ? ` ${tokenInPulsex.symbol}` : ''} for ${tokenOutPulsex?.symbol ? ` ${tokenOutPulsex.symbol}` : ''}`
    }
    return 'Swap'
  })
  const loadingKey = $derived.by(() => {
    if (stage === settings.stage.ONBOARD) {
      return 'bridge-to-pulsechain'
    }
    return pulsexQuoteResult ? 'pulsex-quote' : ''
  })
  const stepTokensDelinked = $derived.by(() => {
    return !!page.queryParams.get('pulsexTokenIn')
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
  invalidValue={amountLessThanMin ?? false}
  onclick={() => {
    if (swappingOnPulsex) {
      amountIn.value = null
      page.setParam('stage', settings.stage.ONBOARD)
    }
  }}
  oninput={({ int }) => {
    if (int !== null) {
      amountIn.value = int
      return int
    }
  }}
  onbalanceupdate={(bal) => {
    // set ethereum balance
    maxCrossPulsechainBridge = bal
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
        if (token) {
          amountIn.value = null
          page.setParam('bridgeTokenIn', token.address === zeroAddress ? null : token.address)
        }
        close()
      }}></TokenSelect>
  {/snippet}
  {#snippet underinput()}
    <BridgeProgressTxInputToggle />
  {/snippet}
</SectionInput>
{#if bridgingToPulsechain}
  <BridgeProgress
    oncomplete={() => {
      if (!bridgingToPulsechain) {
        return
      }
      page.setParam('stage', settings.stage.SWAP)
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
  focused={true}
  token={bridgingToPulsechain ? bridgeTokenOut : pulsexTokenIn}
  value={bridgingToPulsechain ? amountOutputFromBridge : amountInputToPulsex}
  compressed={!swappingOnPulsex}
  readonlyInput={bridgingToPulsechain}
  readonlyTokenSelect={bridgingToPulsechain}
  onbalanceupdate={() => {}}
  onclick={() => {
    if (bridgingToPulsechain) {
      amountInputToPulsex = 0n
      amountIn.value = null
      pulsexQuoteResult = null
      page.setParam('stage', settings.stage.SWAP)
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
  {#snippet radio()}
    {#if stepTokensDelinked}
      <Button
        class="flex size-5 text-surface-contrast-50"
        onclick={() => {
          amountInputToPulsex = 0n
          page.setParam('pulsexTokenIn', null)
        }}>
        <Icon icon="fontisto:undo" />
      </Button>
    {/if}
  {/snippet}
  {#snippet modal({ close })}
    <TokenSelect
      chains={[Number(Chains.PLS)]}
      selectedChain={Number(Chains.PLS)}
      tokens={possiblePulsexTokens}
      selectedToken={tokenInPulsex}
      onsubmit={(token) => {
        if (token) {
          lastUpdatedWasOutput = false
          pulsexQuoteResult = null
          amountInputToPulsex = 0n
          page.setParam('pulsexTokenIn', token.address)
        }
        close()
      }}></TokenSelect>
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
  onbalanceupdate={accountState.address ? () => {} : undefined}
  overrideAccount={recipient.value}
  onclick={() => {
    if (!swappingOnPulsex) {
      amountInputToPulsex = 0n
      pulsexQuoteResult = null
      amountIn.value = null
      page.setParam('stage', settings.stage.SWAP)
    }
  }}>
  {#snippet modal({ close })}
    <TokenSelect
      chains={[Number(Chains.PLS)]}
      selectedChain={Number(Chains.PLS)}
      tokens={possiblePulsexTokens}
      selectedToken={finalTokenOutput}
      onsubmit={(token) => {
        if (token) {
          lastUpdatedWasOutput = true
          pulsexQuoteResult = null
          amountInputToPulsex = 0n
          amountIn.value = null
          page.setParam('pulsexTokenOut', token.address === zeroAddress ? null : token.address)
        }
        close()
      }}></TokenSelect>
  {/snippet}
</SectionInput>
<OnboardButton
  disabled={buttonDisabled}
  {requiredChain}
  onclick={onButtonClick}
  text={buttonText}
  {loadingKey} />

{#if page.guide === settings.guide.SHOW}
  <OnboardGuide {bridgingToPulsechain} />
{/if}

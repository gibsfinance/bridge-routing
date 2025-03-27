<script lang="ts">
  import * as transactions from '$lib/stores/transactions'
  import {
    formatUnits,
    getAddress,
    isAddress,
    isHex,
    maxUint256,
    zeroAddress,
    type Hex,
  } from 'viem'
  import TokenAndNetworkSelector from './TokenAndNetworkSelector.svelte'
  import type { Token } from '$lib/types.svelte'
  import {
    availableChains,
    availableTokensPerOriginChain,
    getQuoteStep as getLifiQuoteStep,
    loadData,
    loadTokensForChains,
    tokenIn,
    waitForBridge,
  } from '$lib/stores/lifi.svelte'
  import { settings as bridgeAdminSettings, settingKey } from '$lib/stores/fee-manager.svelte'
  import {
    accountState,
    appkitNetworkById,
    connect,
    evmChainsById,
    getNetwork,
    switchNetwork,
  } from '$lib/stores/auth/AuthProvider.svelte'
  import { ChainType, type RelayerQuoteResponseData } from '@lifi/types'
  import _ from 'lodash'
  import {
    activeOnboardStep,
    foreignBridgeInputs,
    bridgeTx,
    showTooltips,
    plsxTokens,
    type PulsexTokens,
  } from '$lib/stores/storage.svelte'
  import { untrack } from 'svelte'
  import {
    assetLink,
    balances,
    blocks,
    fetchMinBridgeAmountIn,
    loadAssetLink,
    minBridgeAmountIn,
    minBridgeAmountInKey,
    tokenBalanceLoadingKey,
  } from '$lib/stores/chain-events.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import OnboardButton from './OnboardButton.svelte'
  import type { Chain as LIFIChain } from '@lifi/sdk'
  import { transactionButtonPress, send as sendTransaction } from '$lib/stores/transaction'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
  import OnboardRadio from './OnboardRadio.svelte'
  import GuideStep from './GuideStep.svelte'
  import GuideShield from './GuideShield.svelte'
  import Input from './Input.svelte'
  import {
    assetOutKey,
    assetSources,
    bridgeSettings,
    searchKnownAddresses,
  } from '$lib/stores/bridge-settings.svelte'
  import {
    amountIn,
    bridgableTokens,
    bridgeableTokensUnder,
    bridgeKey,
    loadFeeFor,
    oneEther,
    recipient,
  } from '$lib/stores/input.svelte'
  import SelectButtonContents from './SelectButtonContents.svelte'
  import Section from './Section.svelte'
  import NumericInput from './NumericInput.svelte'
  import { getPulseXQuote } from '$lib/stores/pulsex/quote.svelte'
  import type { SerializedTrade } from '$lib/stores/pulsex/transformers'
  import { getTransactionDataFromTrade } from '$lib/stores/pulsex/serialize'
  import lifiLogo from '$lib/images/providers/lifi.svg?raw'
  import BridgeProgress from './BridgeProgress.svelte'

  const toast = getContext('toast') as ToastContext

  let tokenInputLifi = $state<Token | null>(null)
  let tokenOutputLifi = $state<Token | null>(null)
  let amountInputFromLifi = $state(0n)
  let maxCrossToEthereumBridge = $state(0n as bigint | null)
  const destinationAddress = $derived.by(() => foreignBridgeInputs.value?.toAddress ?? null)
  const destinationAddressIsValid = $derived(
    destinationAddress ? isAddress(destinationAddress) : null,
  )
  const getAddr = (address: Hex | string | null | undefined) => {
    return address ? address.toLowerCase() : null
  }
  const fromChain = $derived.by(() => foreignBridgeInputs.value?.fromChain)
  const lifiFromChainIsEvm = $derived.by(() => {
    const chain = availableChains.get(fromChain!)
    return chain?.chainType === ChainType.EVM
  })
  $effect(() => {
    if (
      everLoaded &&
      tokenInputLifi &&
      (tokenInputLifi?.chainId !== foreignBridgeInputs.value?.fromChain ||
        getAddr(tokenInputLifi?.address) !== getAddr(foreignBridgeInputs.value?.fromToken))
    ) {
      foreignBridgeInputs.extend({
        fromChain: tokenInputLifi.chainId,
        fromToken: tokenInputLifi.address,
      })
    }
  })
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
  const fromAddress = $derived.by(() => {
    return accountState.address
  })
  const toAddressLifi = $derived.by(() => {
    return isHex(fromAddress) ? fromAddress : destinationAddress
  })
  const fallbackAddress = '0x0000000000000000000000000000000000000001'
  const quoteInputs = $derived.by(() => {
    const tokenIn = tokenInputLifi
    const tokenOut = tokenOutputLifi
    if (!tokenIn || !tokenOut) {
      console.log('no token in or out', tokenIn, tokenOut)
      return null
    }
    const fromChain = availableChains.get(tokenIn.chainId)
    const toChain = availableChains.get(tokenOut.chainId)
    if (!fromChain || !toChain) {
      console.log('no from or to chain', fromChain, toChain)
      return null
    }
    const originTokens = availableTokensPerOriginChain.get(fromChain!.id)
    if (!originTokens || !originTokens.length) {
      console.log('no origin tokens', originTokens)
      return null
    }
    const destinationChain = availableTokensPerOriginChain.get(toChain!.id)
    if (!destinationChain || !destinationChain.length) {
      console.log('no destination chain tokens', destinationChain)
      return null
    }
    const fromToken = originTokens.find(
      (t) => t.address.toLowerCase() === tokenIn.address.toLowerCase(),
    )
    const toToken = destinationChain.find(
      (t) => t.address.toLowerCase() === tokenOut.address.toLowerCase(),
    )
    // const fromAddress = accountState.address
    //  ?? '0x0000000000000000000000000000000000000001'
    // let toAddress = isHex(fromAddress) ? fromAddress : destinationAddress
    if (
      !fromChain ||
      !toChain ||
      !fromToken ||
      !toToken ||
      !amountInputFromLifi ||
      !fromAddress
      //  ||
      // !toAddressLifi
    ) {
      if (amountInputFromLifi) {
        // console.log(
        //   'no quote inputs',
        //   fromChain,
        //   toChain,
        //   fromToken,
        //   toToken,
        //   amountInputFromLifi,
        //   fromAddress,
        //   toAddressLifi,
        // )
      }
      return null
    }
    return {
      fromChain: fromChain.id,
      toChain: toChain.id,
      fromToken: fromToken.address,
      toToken: toToken.address,
      fromAmount: amountInputFromLifi.toString(),
      fromAddress,
      toAddress: toAddressLifi ?? fallbackAddress,
    }
  })
  $effect(() => {
    // storage
    if (!everLoaded || !tokenInputLifi || !tokenOutputLifi) return
    const update = {
      fromChain: tokenInputLifi.chainId,
      fromToken: tokenInputLifi.address,
      toToken: tokenOutputLifi.address,
      fromAmount: amountInputFromLifi,
      toAddress: (toAddressLifi === fallbackAddress ? null : toAddressLifi) ?? null,
    }
    foreignBridgeInputs.value = update
  })
  let latestLifiQuote: RelayerQuoteResponseData['quote'] | null = $state(null)
  let lifiQuoteError: string | null = $state(null)
  const outLatestBlock = $derived(!tokenOutputLifi ? null : blocks.get(tokenOutputLifi!.chainId))
  const canCrossLifi = $derived.by(() => {
    if (!quoteInputs) return false
    const inputChain = availableChains.get(quoteInputs.fromChain)
    if (inputChain?.chainType === ChainType.EVM) {
      return isHex(quoteInputs.fromToken) && isHex(quoteInputs.fromAddress)
    }
    return !(isHex(quoteInputs.fromToken) || isHex(quoteInputs.fromAddress))
  })
  $effect(() => {
    if (!tokenOutputLifi) return
    if (
      !quoteInputs ||
      !outLatestBlock ||
      !outLatestBlock.number ||
      !canCrossLifi ||
      !bridgingToEthereum
    ) {
      return
    }
    const quote = getLifiQuoteStep({
      ...quoteInputs,
      blockNumber: outLatestBlock.number,
    })
    lifiQuoteError = null
    quote.promise
      .then((q) => {
        if (quote.controller.signal.aborted) return
        // console.log('quote', q)
        latestLifiQuote = q
      })
      .catch((e) => {
        console.log(e, quoteInputs)
        lifiQuoteError = 'Quote request resulted in an error, try increasing the amount in'
      })
    return quote.cleanup
  })
  const lifiQuoteMatchesLatest = $derived.by(() => {
    if (!latestLifiQuote || !quoteInputs) return false
    const { action } = latestLifiQuote
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
  const amountOutputFromLifi = $derived.by(() => {
    if (!latestLifiQuote) return null
    return latestLifiQuote.estimate.toAmount ? BigInt(latestLifiQuote.estimate.toAmount) : null
  })
  const incrementLifiAllowance = $derived(
    !tokenInputLifi
      ? _.noop
      : transactionButtonPress({
          toast,
          chainId: Number(tokenInputLifi!.chainId),
          steps: [
            async () => {
              const token = tokenInputLifi!
              return await transactions.checkAndRaiseApproval({
                token: token.address! as Hex,
                spender: latestLifiQuote!.transactionRequest!.to as Hex,
                chainId: Number(token.chainId),
                minimum: amountInputFromLifi,
                latestBlock: blocks.get(Number(token.chainId))!,
              })
            },
          ],
          after: () => {
            const token = tokenInputLifi!
            if (!token) return
            balances.delete(
              tokenBalanceLoadingKey(Number(token.chainId), token.address!, accountState.address!),
            )
          },
        }),
  )
  const initiateLifiFromEvmBridge = $derived(
    !tokenInputLifi
      ? _.noop
      : transactionButtonPress({
          toast,
          chainId: Number(tokenInputLifi!.chainId),
          steps: [
            async () => {
              const token = tokenInputLifi!
              const tx = await transactions.sendTransaction({
                chainId: Number(token.chainId),
                account: accountState.address as Hex,
                data: latestLifiQuote!.transactionRequest!.data as Hex,
                gas: BigInt(latestLifiQuote!.transactionRequest!.gasLimit ?? 0),
                gasPrice: BigInt(latestLifiQuote!.transactionRequest!.gasPrice ?? 0),
                to: latestLifiQuote!.transactionRequest!.to as Hex,
                value: BigInt(latestLifiQuote!.transactionRequest!.value ?? 0),
              })
              return tx
            },
          ],
        }),
  )
  let lifiAllowance = $state(null as bigint | null)
  const needsAllowanceForLifi = $derived.by(() => {
    const pushValue = latestLifiQuote?.transactionRequest?.value
    if ((pushValue && BigInt(pushValue) > 0n) || !lifiFromChainIsEvm) {
      return false
    }
    return lifiAllowance === null || lifiAllowance < amountInputFromLifi
  })
  const needsApprovalForLifi = $derived.by(() => {
    return needsAllowanceForLifi && (lifiAllowance === null || lifiAllowance < amountInputFromLifi)
  })
  // $inspect(latestLifiQuote)
  const lifiSpender = $derived.by(() => latestLifiQuote?.transactionRequest?.to)
  $effect(() => {
    const token = tokenInputLifi
    if (!token) return
    const spender = lifiSpender
    const tokenAddress = token.address
    const account = accountState.address
    const chainId = token.chainId
    if (!tokenAddress || !needsAllowanceForLifi || !account || !spender || !chainId) {
      return
    }
    const result = transactions.loadAllowance({
      token: tokenAddress as Hex,
      spender: spender as Hex,
      chainId: Number(chainId),
      account: account as Hex,
    })
    result.promise.then((a) => {
      if (result.controller.signal.aborted) return
      lifiAllowance = a
    })
    return result.cleanup
  })
  // const crossForeignBridge = $derived.by(() => {
  //   if (needsAllowance) {
  //     if (!allowance || allowance < amountInputFromLifi) {
  //       return getLifiApproval
  //     }
  //   }
  //   return sendLifiTransaction
  // })
  const buttonEnabled = $derived.by(() => {
    if (bridgingToEthereum) {
      if (!lifiFromChainIsEvm && !destinationAddressIsValid) {
        return false
      }
      return (
        lifiQuoteMatchesLatest &&
        !!latestLifiQuote &&
        !!amountOutputFromLifi &&
        !!amountInputFromLifi &&
        !!accountState.address
      )
    } else if (bridgingToPulsechain) {
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
  const requiredLifiChain = $derived.by(() => {
    const token = tokenInputLifi
    if (!token) return null
    return availableChains.get(token.chainId)! as LIFIChain
  })
  const chains = $derived.by(() => {
    return [...availableChains.keys()] as [number, ...number[]]
  })
  const bridgeableTokensSettings = {
    provider: Provider.PULSECHAIN,
    chain: Number(Chains.ETH),
    partnerChain: Number(Chains.PLS),
  }
  const crossingTokenInput = $derived.by(() => {
    const tokens = bridgableTokens.bridgeableTokensUnder(bridgeableTokensSettings)
    return tokens.find((t) => t.address === zeroAddress) ?? null
  })
  const crossingTokenOutputAddress = $derived.by(() => {
    return crossingTokenInput?.extensions?.bridgeInfo?.[Number(Chains.PLS)]?.tokenAddress
  })
  $effect(() => {
    if (!crossingTokenInput) return
    const settingsMatch =
      bridgeKey.provider === Provider.PULSECHAIN &&
      bridgeKey.fromChain === Chains.ETH &&
      bridgeKey.toChain === Chains.PLS
    if (!settingsMatch) {
      bridgeKey.value = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS]
      bridgeKey.assetInAddress = crossingTokenInput.address as Hex
    }
  })
  const crossingTokenOutput = $derived.by(() => {
    const tokens = bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(Chains.PLS),
      partnerChain: Number(Chains.ETH),
    })
    return tokens.find((t) => t.address === crossingTokenOutputAddress) ?? null
  })
  const finalTokenOutput = $derived.by(() => {
    const tokens = bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(Chains.PLS),
      partnerChain: Number(Chains.ETH),
    })
    return tokens.find((t) => t.address === zeroAddress) ?? null
  })
  const bridgingToEthereum = $derived(activeOnboardStep.value === 1)
  const bridgingToPulsechain = $derived(activeOnboardStep.value === 2)
  const swappingOnPulsex = $derived(activeOnboardStep.value === 3)

  const bridgeAmount = $derived(amountIn.value ?? 0n)
  const bridgeFeePercent = $derived(
    bridgeAdminSettings.get(settingKey(bridgeKey.value))?.feeF2H ?? 0n,
  )
  const bridgeFeeAmount = $derived((bridgeFeePercent * bridgeAmount) / oneEther)
  const amountOutputFromBridge = $derived(bridgeAmount - bridgeFeeAmount)
  let amountInputToPulsex = $state(0n)
  // const amountOutputFromPulsex = $derived(0n)
  // $effect.pre(() => {
  //   if (tokenInput || bridgeKey.fromChain !== Chains.ETH) return
  //   bridgeSettings.assetIn.value = {
  //     address: zeroAddress,
  //     chainId: Number(bridgeKey.fromChain),
  //     decimals: 18,
  //     logoURI: assetSources(tokenInput),
  //     symbol: 'ETH',
  //     name: 'Ether',
  //   }
  // })

  // $effect(() => {
  //   const assetOutputKey = assetOutKey({
  //     bridgeKeyPath: bridgeKey.path,
  //     assetInAddress: tokenInput?.address as Hex,
  //     unwrap: false,
  //   })
  //   if (!tokenInput || !assetOutputKey) return
  //   const tokensUnderBridgeKey = bridgableTokens.bridgeableTokensUnder({
  //     provider: Provider.PULSECHAIN,
  //     chain: Number(bridgeKey.toChain),
  //     partnerChain: Number(bridgeKey.fromChain),
  //   })
  //   const link = loadAssetLink({
  //     bridgeKey: bridgeKey.value,
  //     assetIn: tokenInput,
  //   })
  //   link.promise.then((l) => {
  //     if (link.controller.signal.aborted || !l?.assetOutAddress) return
  //     // reverse the chains here because we are looking for the destination
  //     let assetOut = searchKnownAddresses({
  //       tokensUnderBridgeKey,
  //       address: l?.assetOutAddress,
  //       customTokens: [],
  //     })
  //     assetLink.value = l
  //     if (!assetOut) return
  //     bridgeSettings.setAssetOut(assetOutputKey, {
  //       ...assetOut,
  //       logoURI: bridg.logoURI,
  //     })
  //   })
  //   return link.cleanup
  // })
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
  // const incrementLifiAllowance = $derived(
  //   transactionButtonPress({
  //     toast,
  //     chainId: Number(bridgeKey.fromChain),
  //     steps: [
  //       async () => {
  //         if (!accountState.address) return
  //         return await transactions.checkAndRaiseApproval({
  //           token: tokenInputLifi!.address! as Hex,
  //           spender: bridgeSettings.bridgePathway!.from!,
  //           chainId: Number(bridgeKey.fromChain),
  //           minimum: bridgeAmount,
  //           latestBlock: blocks.get(Number(bridgeKey.fromChain))!,
  //         })
  //       },
  //     ],
  //   }),
  // )
  // const initiateLifiFromEvmBridge = $derived(
  //   transactionButtonPress({
  //     toast,
  //     chainId: Number(bridgeKey.fromChain),
  //     steps: [
  //       async () => {
  //         const tx = await transactions.sendTransaction({
  //           account: accountState.address as Hex,
  //           chainId: Number(bridgeKey.fromChain),
  //           ...bridgeSettings.transactionInputs,
  //         })
  //         bridgeTx.extend({
  //           hash: tx,
  //         })
  //         return tx
  //       },
  //     ],
  //   }),
  // )
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
  // const bridgeTokensToPulsechain = () => {
  //   if (pulsechainBridgeNeedsApproval) return incrementApproval()
  //   return initiateBridge()
  // }
  const originationTicker = $derived(blocks.get(Number(bridgeKey.fromChain)))
  const bridgeApproval = $derived(bridgeSettings.approval.value)
  const needsAllowanceForPulsechainBridge = $derived(
    bridgeApproval !== null && bridgeApproval < bridgeSettings.amountToBridge,
  )
  bridgeSettings.assetIn.value = {
    address: zeroAddress,
    chainId: Number(bridgeKey.fromChain),
    decimals: 18,
    symbol: 'ETH',
    name: 'Ether',
  }
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
  // const disableBridgeButton = $derived.by(() => {
  //   const minAmountIn = minBridgeAmountIn.get(minBridgeAmountKey)
  //   return (
  //     !maxCrossPulsechainBridge ||
  //     !amountIn.value ||
  //     !minAmountIn ||
  //     amountIn.value < minAmountIn ||
  //     amountIn.value > maxCrossPulsechainBridge
  //   )
  // })
  // const lifiNeedsAllowance = false
  // const tokenOutputAddress = $derived(plsOutToken.value)
  const defaultPulsexTokens = {
    tokenIn: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
    tokenOut: zeroAddress,
  } as const
  const { tokenIn: tokenInAddress, tokenOut: tokenOutAddress } = $derived({
    ...defaultPulsexTokens,
    ...(plsxTokens.value ?? {}),
  })
  $inspect(tokenInAddress, tokenOutAddress)
  const tokens = $derived(
    bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(Chains.PLS),
      partnerChain: null,
    }),
  )
  const findToken = (address: Hex) => {
    return tokens.find((t) => getAddress(t.address) === getAddress(address))
  }
  const tokenInPulsex = $derived.by(() => {
    return findToken(tokenInAddress) ?? findToken(defaultPulsexTokens.tokenIn) ?? null
  })
  const tokenOutPulsex = $derived.by(() => {
    return findToken(tokenOutAddress) ?? findToken(defaultPulsexTokens.tokenOut) ?? null
  })
  const tokenOut = $derived.by(() => {
    return findToken(tokenOutAddress) ?? findToken(defaultPulsexTokens.tokenOut) ?? null
  })
  // let amountToSwapIn = $state<bigint | null>(0n)
  // let amountOutputFromPulsex = $state<bigint | null>(null)
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
    console.log('getting pulsex quote', tokenInPulsex, tokenOutPulsex)
    const quote = getPulseXQuote({
      tokenIn: tokenInPulsex,
      tokenOut: tokenOutPulsex,
      amountIn: amountInputToPulsex,
      amountOut: null,
    })
    quote.promise.then((result) => {
      if (quote.controller.signal.aborted || !result) return
      console.log('pulsex quote result', result)
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
  $inspect(pulsexQuoteResult?.outputAmount, amountOutputFromPulsex)
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
  $inspect(latestLifiQuote)
  const initiateLifiFromNonEvmBridge = $derived.by(() => {
    const quote = latestLifiQuote
    return () =>
      sendTransaction({
        toast,
        steps: [
          async () => {
            const receipt = await transactions.sendTransactionSolana({
              data: quote!.transactionRequest!.data!,
            })
            console.log(receipt)
            return receipt
          },
        ],
        wait: async (txHash) => {
          const status = await waitForBridge({
            txHash,
            fromChain: quote?.action.fromChainId,
            toChain: quote?.action.toChainId,
            bridge: quote?.tool,
            timeout: new AbortController(),
          })
          console.log('status', status)
          if (_.isEqual(quote?.action, latestLifiQuote?.action)) {
            // move the system forward
            activeOnboardStep.value = 2
            return
          }
        },
      })
  })
  const bridgeTokensToEthereumStep = $derived.by(() => {
    if (needsApprovalForLifi) {
      return incrementLifiAllowance
    }
    if (lifiFromChainIsEvm) {
      return initiateLifiFromEvmBridge
    }
    return initiateLifiFromNonEvmBridge
  })
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
    if (bridgingToEthereum) {
      return bridgeTokensToEthereumStep
    } else if (bridgingToPulsechain) {
      return bridgeTokensToPulsechainStep
    }
    return swapPulsexStep
  })
  const requiredChain = $derived.by(() => {
    if (activeOnboardStep.value === 1) {
      return requiredLifiChain
    }
    const chainId = activeOnboardStep.value === 2 ? Chains.ETH : Chains.PLS
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
      if (needsApprovalForLifi) {
        return 'Approve'
      }
      return 'Exchange'
    } else if (activeOnboardStep.value === 2) {
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
      return 'lifi-quote'
    } else if (activeOnboardStep.value === 2) {
      return 'bridge-to-pulsechain'
    }
    return pulsexQuoteResult ? 'pulsex-quote' : ''
  })
</script>

<div class="flex flex-col gap-2">
  <SectionInput
    showRadio
    label={bridgingToEthereum ? 'Bridge to Ethereum' : 'Input'}
    focused={bridgingToEthereum}
    token={tokenInputLifi}
    value={amountInputFromLifi}
    compressed={!bridgingToEthereum}
    dashWhenCompressed={!bridgingToEthereum}
    readonlyInput={!bridgingToEthereum}
    readonlyTokenSelect={!bridgingToEthereum}
    inputWarning={lifiQuoteError ?? null}
    valueLoadingKey="lifi-quote"
    onbalanceupdate={(balance) => {
      maxCrossToEthereumBridge = balance
    }}
    onmax={(balance) => {
      amountInputFromLifi = balance
    }}
    onclick={() => {
      if (bridgingToPulsechain || swappingOnPulsex) {
        activeOnboardStep.value = 1
      }
    }}
    oninput={({ int }) => {
      if (bridgingToEthereum) {
        // amountOutputFromLifi = 0n
        latestLifiQuote = null
      }
      if (int !== null) {
        amountInputFromLifi = int
        if (!maxCrossToEthereumBridge) return int
        return int < maxCrossToEthereumBridge ? int : maxCrossToEthereumBridge
      }
    }}>
    {#snippet modal({ close })}
      {#if tokenInputLifi}
        <TokenAndNetworkSelector
          chainId={Number(tokenInputLifi.chainId)}
          {chains}
          selectedToken={tokenInputLifi}
          onsubmit={(token) => {
            if (token) {
              tokenInputLifi = token
            }
            close()
          }} />
      {/if}
    {/snippet}
  </SectionInput>
  {#if bridgingToEthereum && !lifiFromChainIsEvm}
    <Input
      class="border rounded-2xl py-2 px-4 focus:ring-0 text-surface-contrast-50 {destinationAddressIsValid ===
      null
        ? 'border-gray-300'
        : destinationAddressIsValid
          ? 'border-success-300'
          : 'border-red-500'}"
      placeholder="Ethereum recipient address (0x...)"
      value={destinationAddress}
      oninput={(str) => {
        foreignBridgeInputs.extend({
          toAddress: str,
        })
      }} />
  {/if}
  <SectionInput
    label={bridgingToEthereum ? 'Output' : 'Bridge to Pulsechain'}
    focused={bridgingToPulsechain}
    token={crossingTokenInput}
    value={bridgingToEthereum ? amountOutputFromLifi : amountIn.value}
    compressed={!bridgingToEthereum && !bridgingToPulsechain}
    dashWhenCompressed={swappingOnPulsex}
    readonlyInput={!bridgingToPulsechain}
    overrideAccount={lifiFromChainIsEvm ? null : destinationAddress}
    readonlyTokenSelect={!bridgingToPulsechain}
    valueLoadingKey={bridgingToEthereum ? 'lifi-cross-chain-swap' : null}
    onclick={() => {
      if (bridgingToEthereum || swappingOnPulsex) {
        activeOnboardStep.value = 2
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
    onmax={bridgingToEthereum
      ? undefined
      : (balance) => {
          // set ethereum balance
          amountIn.value = balance
        }}>
    {#snippet radio()}
      {#if bridgingToEthereum}
        <span class="text-xs text-gray-500 flex flex-row items-center gap-1"
          >powered by<span class="[&>svg]:w-9 [&>svg]:h-5 translate-y-0.25">{@html lifiLogo}</span
          ></span>
      {/if}
    {/snippet}
  </SectionInput>
  {#if bridgingToPulsechain}
    <BridgeProgress
      oncomplete={() => {
        if (!bridgingToPulsechain) {
          return
        }
        activeOnboardStep.value = 3
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
    focused={activeOnboardStep.value >= 2}
    token={crossingTokenOutput}
    value={bridgingToEthereum || bridgingToPulsechain
      ? amountOutputFromBridge
      : amountInputToPulsex}
    compressed={!swappingOnPulsex}
    dashWhenCompressed={bridgingToEthereum}
    readonlyInput={!swappingOnPulsex}
    readonlyTokenSelect
    onbalanceupdate={() => {}}
    onclick={() => {
      if (bridgingToPulsechain || bridgingToEthereum) {
        activeOnboardStep.value = 3
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
    }} />
  <SectionInput
    label="Output"
    token={finalTokenOutput}
    value={amountOutputFromPulsex}
    focused={swappingOnPulsex}
    compressed={!swappingOnPulsex}
    dashWhenCompressed
    readonlyInput
    readonlyTokenSelect
    onbalanceupdate={() => {}}
    overrideAccount={destinationAddress}
    onclick={() => {
      if (!swappingOnPulsex) {
        activeOnboardStep.value = 3
      }
    }} />
  <OnboardButton
    disabled={!buttonEnabled}
    {requiredChain}
    onclick={onButtonClick}
    text={buttonText}
    {loadingKey} />
</div>

{#if showTooltips.value}
  <div class="absolute top-0 left-0 w-full h-full">
    <GuideShield show={true} />
    {#if bridgingToEthereum}
      <GuideStep step={1} triggerClass="absolute right-24 top-4">
        <p>Select the token and network you want to move from.</p>
      </GuideStep>
      <GuideStep step={2} triggerClass="absolute right-24 bottom-4">
        <p>Send the token through li.fi to get to Ethereum.</p>
      </GuideStep>
    {:else if bridgingToPulsechain}
      <GuideStep step={1} triggerClass="absolute right-24 top-20">
        <p>Select the token you wish to bridge to PulseChain.</p>
      </GuideStep>
      <GuideStep step={2} triggerClass="absolute right-24 bottom-4">
        <p>Trigger the bridge to PulseChain.</p>
      </GuideStep>
    {:else}
      <GuideStep step={1} triggerClass="absolute right-24 top-36">
        <p>Select the token you wish to swap from.</p>
      </GuideStep>
      <GuideStep step={2} triggerClass="absolute right-24 bottom-4">
        <p>Trigger the swap on PulseX.</p>
      </GuideStep>
    {/if}
    <!-- <GuideStep step={2} triggerClass="absolute top-24 left-5">
      <p>Set an amount to bridge.</p>
    </GuideStep>
    <GuideStep step={3} triggerClass="absolute top-1/2 right-5">
      <p>Select output token on Ethereum.</p>
    </GuideStep>
    <GuideStep step={4} triggerClass="absolute left-0 right-0 mx-auto bottom-5">
      <p>Initiate cross chain swap to Ethereum.</p>
    </GuideStep> -->
  </div>
{/if}

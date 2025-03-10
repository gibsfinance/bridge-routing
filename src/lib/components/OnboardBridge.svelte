<script lang="ts">
  import * as transactions from '$lib/stores/transactions'
  import TokenIcon from './TokenIcon.svelte'
  import type { Token } from '$lib/types.svelte'
  import { isHex, zeroAddress, type Hex } from 'viem'
  import { Chains } from '$lib/stores/auth/types'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import {
    assetSources,
    bridgeSettings,
    oneEther,
    searchKnownAddresses,
  } from '$lib/stores/bridge-settings.svelte'
  import NumericInput from './NumericInput.svelte'
  import VerticalDivider from './ExchangeInputDivider.svelte'
  import BalanceReadout from './BalanceReadout.svelte'
  import Loader from './Loader.svelte'
  import {
    assetLink,
    loadAssetLink,
    minAmount,
    watchWplsUSDPrice,
    liveBridgeStatus,
    bridgeStatuses,
    type ContinuedLiveBridgeStatusParams,
    latestBlock,
  } from '$lib/stores/chain-events.svelte'
  import {
    amountIn,
    bridgableTokens,
    bridgeableTokensUnder,
    bridgeFee,
    loadFeeFor,
    recipient,
    bridgeKey,
  } from '$lib/stores/input.svelte'
  import { humanReadableNumber, usd } from '$lib/stores/utils'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import { untrack } from 'svelte'
  import { bridgeTxHash, foreignBridgeInputs } from '$lib/stores/storage.svelte'
  import OnboardStep from './OnboardStep.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import OnboardButton from './OnboardButton.svelte'
  import { availableChains } from '$lib/stores/lifi.svelte'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'

  const toast = getContext('toast') as ToastContext

  const bridgedToken = $derived(bridgeSettings.assetOut.value as Token | null)
  const bridgeAmount = $derived(amountIn.value ?? 0n)
  const bridgeFeePercent = $derived(bridgeFee.value?.feeF2H ?? 0n)
  const bridgeFeeAmount = $derived((bridgeFeePercent * bridgeAmount) / oneEther)
  const outputAmount = $derived(bridgeAmount - bridgeFeeAmount)
  const tokenInput = $derived(bridgeSettings.assetIn.value)

  let editTxHash = $state(false)
  let editTxHashValue = $state('')
  $effect(() => {
    if (!tokenInput) return
    const tokensUnderBridgeKey = bridgeableTokensUnder({
      tokens: bridgableTokens.value,
      chain: Number(bridgeKey.toChain),
      partnerChain: Number(bridgeKey.fromChain),
    })
    const link = loadAssetLink({
      bridgeKey: bridgeKey.value,
      assetIn: tokenInput,
    })
    link.promise.then((l) => {
      if (link.controller.signal.aborted || !l?.assetOutAddress) return
      // reverse the chains here because we are looking for the destination
      let assetOut = searchKnownAddresses({
        tokensUnderBridgeKey,
        address: l?.assetOutAddress,
        customTokens: [],
      })
      assetLink.value = l
      bridgeSettings.assetOut.value = assetOut
        ? {
            ...assetOut,
            logoURI: tokenInput.logoURI,
          }
        : null
    })
    return link.cleanup
  })
  $effect(() => {
    const result = loadFeeFor(bridgeKey)
    result.promise.then((fee) => {
      if (result.controller.signal.aborted) return
      bridgeFee.value = fee
    })
    return result.cleanup
  })
  $effect(() => {
    recipient.value = accountState.address ?? zeroAddress
  })
  let tx: Hex | null = $state(null)
  $effect(() => {
    tx = localStorage.getItem('bridge-tx') as Hex | null
  })
  const bridgeTokens = transactionButtonPress({
    toast,
    steps: [
      async () => {
        if (!accountState.address) return
        return await transactions.checkAndRaiseApproval({
          token: tokenInput!.address! as Hex,
          spender: bridgeSettings.bridgePathway!.from!,
          chainId: Number(bridgeKey.fromChain),
          minimum: bridgeAmount,
        })
      },
      async () => {
        const tx = await transactions.sendTransaction({
          account: accountState.address,
          chainId: Number(bridgeKey.fromChain),
          ...bridgeSettings.transactionInputs,
        })
        // setTxHash(tx)
        bridgeTxHash.value = tx
        incrementBridgeStatus()
        transactions.wait(tx).then(() => {
          incrementBridgeStatus()
        })
        return tx
      },
    ],
  })
  // const setTxHash = (hash: Hex) => {
  //   tx = hash
  //   // localStorage.setItem('bridge-tx', hash)
  // }
  let usdMultiplier = $state(0n)
  const wplsTokenPrice = new SvelteMap<string, bigint>()
  const key = $derived(`${bridgeKey.toChain}-${bridgedToken?.address}`.toLowerCase())
  const destinationBlock = $derived(latestBlock.block(Number(bridgeKey.toChain)))
  $effect(() => {
    if (!destinationBlock) return
    const watcher = watchWplsUSDPrice(destinationBlock)
    watcher.promise.then((price) => {
      if (watcher.controller.signal.aborted) return
      usdMultiplier = price ?? 0n
    })
    return watcher.cleanup
  })
  const priceAsInt = $derived(wplsTokenPrice.get(key) ?? 0n)
  const usdValueInt = $derived(
    priceAsInt && usdMultiplier ? ((priceAsInt ?? 0n) * oneEther) / usdMultiplier : 0n,
  )
  const usdValueTokenAmount = $derived(
    !amountIn.value
      ? 0n
      : (usdValueInt * amountIn.value) / 10n ** BigInt(tokenInput?.decimals ?? 18),
  )
  let bridgeStatus = $state<ContinuedLiveBridgeStatusParams | null>(null)
  $effect(() => {
    if (!bridgeSettings.assetIn.value) return
    return minAmount.fetch(bridgeKey.value, bridgeSettings.assetIn.value)
  })
  const incrementBridgeStatus = () => {
    if (bridgeStatus === null) {
      bridgeStatus = {
        bridgeKey,
        hash: tx!,
        ticker: untrack(() => latestBlock.block(Number(bridgeKey.toChain))!),
        status: bridgeStatuses.SUBMITTED,
        statusIndex: 0,
      }
    } else if (bridgeStatus.status === bridgeStatuses.SUBMITTED) {
      bridgeStatus = {
        ...bridgeStatus,
        status: bridgeStatuses.MINED,
        statusIndex: 1,
      }
    } else if (bridgeStatus.status === bridgeStatuses.MINED) {
      bridgeStatus = {
        ...bridgeStatus,
        status: bridgeStatuses.FINALIZED,
        statusIndex: 2,
      }
    } else if (bridgeStatus.status === bridgeStatuses.FINALIZED) {
      bridgeStatus = {
        ...bridgeStatus,
        status: bridgeStatuses.VALIDATING,
        statusIndex: 3,
      }
    } else if (bridgeStatus.status === bridgeStatuses.VALIDATING) {
      bridgeStatus = {
        ...bridgeStatus,
        status: bridgeStatuses.AFFIRMED,
        statusIndex: 4,
      }
    } else if (bridgeStatus.status === bridgeStatuses.AFFIRMED) {
      bridgeStatus = null
    }
  }
  const bridgeGoClassNames = $derived(
    'btn bg-tertiary-500 text-surface-contrast-950 h-16 rounded-none px-6 w-16 flex basis-auto text-base' +
      (bridgeStatus !== null && !editTxHash ? ' rounded-b-none' : ''),
  )
  const percentProgress = $derived.by(() => {
    if (bridgeStatus === null) return 0
    switch (bridgeStatus.status) {
      case bridgeStatuses.SUBMITTED:
        return 30
      case bridgeStatuses.MINED:
        return 50
      case bridgeStatuses.FINALIZED:
        return 75
      // case bridgeStatuses.VALIDATING:
      //   return 80
      case bridgeStatuses.AFFIRMED:
        return 100
    }
  })
  const clearTxTracking = () => {
    const localTx = localStorage.getItem('bridge-tx')
    if (tx === localTx) {
      console.log('clearing tx tracking', localTx, bridgeStatus?.deliveredHash)
      localStorage.removeItem('bridge-tx')
      tx = null
    }
    bridgeStatus = null
  }
  let maxBridgeable = $state(0n as bigint | null)
  const disableBridgeButton = $derived(
    // bridgeStatus !== null ||
    !maxBridgeable ||
      !amountIn.value ||
      !minAmount.value ||
      amountIn.value < minAmount.value ||
      amountIn.value > maxBridgeable,
  )
  $effect(() => {
    if (!tx || !destinationBlock) {
      return
    }
    const result = liveBridgeStatus({
      bridgeKey,
      hash: tx,
      ticker: destinationBlock,
    })
    result.promise.then((liveResult) => {
      if (result.controller.signal.aborted) return
      if (liveResult?.hash !== tx) {
        const local = localStorage.getItem('bridge-tx')
        if (!local) return
        tx = local as Hex
      }
      bridgeStatus = liveResult ?? null
    })
    return result.cleanup
  })
  const bridgeStatusETATooltip = $derived.by(() => {
    const slotCount = 32n
    const blockTime = 12n
    switch (bridgeStatus?.status) {
      case bridgeStatuses.SUBMITTED:
        return 'This transaction is still being validated by the network.'
      case bridgeStatuses.MINED:
        const currentlyFinalizedBlock = bridgeStatus?.finalizedBlock?.number
        const currentBlock = untrack(() => latestBlock.block(Number(bridgeKey.fromChain))?.number)
        let estimatedFutureFinalizedBlock = currentlyFinalizedBlock
        const minedBlock = bridgeStatus.receipt?.blockNumber
        if (
          !currentlyFinalizedBlock ||
          !estimatedFutureFinalizedBlock ||
          !minedBlock ||
          !currentBlock
        )
          return 'mined'
        let delta = minedBlock - currentBlock + 96n + 6n
        if (delta < 0n) {
          return '<20s'
        }
        delta += 3n
        while (estimatedFutureFinalizedBlock < minedBlock) {
          estimatedFutureFinalizedBlock += slotCount
        }
        if (estimatedFutureFinalizedBlock === currentlyFinalizedBlock) {
          return '<20s'
        }
        const totalSeconds = delta * blockTime
        const seconds = totalSeconds % 60n
        const minutes = (totalSeconds - seconds) / 60n
        if (minutes > 3n) {
          return `<${minutes}m`
        } else if (!minutes) {
          return `<${seconds}s`
        }
        return `<${minutes}m ${seconds}s`
      case bridgeStatuses.FINALIZED:
        return '<20s'
      case bridgeStatuses.VALIDATING:
        return '<10s'
    }
    return null
  })
  $effect(() => {
    if (bridgeStatus?.status === bridgeStatuses.AFFIRMED) {
      const lastTxHash = untrack(() => bridgeStatus?.hash)
      setTimeout(() => {
        if (lastTxHash === localStorage.getItem('bridge-tx')) {
          clearTxTracking()
        }
      }, 10_000)
    }
  })
  let editTxInput: HTMLInputElement | null = $state(null)
  const toggleEditTxHash = () => {
    editTxHash = !editTxHash
    if (editTxHash) {
      setTimeout(() => {
        editTxInput?.focus()
      }, 400)
    }
  }
</script>

<OnboardStep icon="line-md:chevron-double-down">
  {#snippet input()}
    <SectionInput
      focused
      label="Input"
      token={tokenInput ?? {
        address: zeroAddress,
        chainId: Number(bridgeKey.fromChain),
        decimals: 18,
        logoURI: assetSources(tokenInput),
        symbol: 'ETH',
        name: 'Ether',
      }}
      showRadio
      value={amountIn.value}
      onbalanceupdate={(balance) => {
        maxBridgeable = balance
      }}
      onmax={(balance) => {
        amountIn.value = balance
      }}
      oninput={(v) => {
        amountIn.value = v
      }}>
      {#snippet modal({ close })}
        <TokenSelect
          chains={[Number(Chains.ETH)]}
          tokens={bridgeableTokensUnder({
            tokens: bridgableTokens.value,
            chain: Number(bridgeKey.fromChain),
            partnerChain: Number(bridgeKey.toChain),
          })}
          onsubmit={(tkn) => {
            if (tkn) {
              bridgeSettings.assetIn.value = tkn as Token
              foreignBridgeInputs.value = {
                ...foreignBridgeInputs.value!,
                toToken: tkn.address,
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
      token={bridgedToken ?? {
        address: zeroAddress,
        chainId: Number(bridgeKey.toChain),
        decimals: 18,
        logoURI: assetSources(bridgedToken),
        symbol: 'ETH',
        name: 'Ether',
      }}
      readonly
      value={outputAmount}
      onbalanceupdate={() => {}}>
    </SectionInput>
  {/snippet}
  {#snippet button()}
    <OnboardButton
      disabled={disableBridgeButton}
      requiredChain={availableChains.get(tokenInput!.chainId)!}
      onclick={bridgeTokens}
      text="Bridge to PulseChain"
      loadingKey="lifi-quote" />
  {/snippet}
</OnboardStep>

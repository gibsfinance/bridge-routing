<script lang="ts">
  import TokenIcon from './TokenIcon.svelte'
  import type { Token } from '$lib/types.svelte'
  import { isHex, zeroAddress, type Hex } from 'viem'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import { Chains } from '$lib/stores/auth/types'
  import { accountState, wagmiAdapter } from '$lib/stores/auth/AuthProvider.svelte'
  import {
    assetSources,
    bridgeSettings,
    oneEther,
    searchKnownAddresses,
  } from '$lib/stores/bridge-settings.svelte'
  import NumericInput from './NumericInput.svelte'
  import VerticalDivider from './VerticalDivider.svelte'
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
    origination,
    destination,
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
  import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import Loading from './Loading.svelte'
  import Tooltip from './Tooltip.svelte'
  import ExplorerLink from './ExplorerLink.svelte'
  import Input from './Input.svelte'
  import { untrack } from 'svelte'
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
      chain: bridgeKey.toChain,
      partnerChain: bridgeKey.fromChain,
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
  const bridgeTokens = async () => {
    if (!accountState.address) return
    const tx = await sendTransaction(wagmiAdapter.wagmiConfig, {
      account: accountState.address,
      ...bridgeSettings.transactionInputs,
    })
    setTxHash(tx)
    incrementBridgeStatus()
    waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
      hash: tx,
    }).then(() => {
      incrementBridgeStatus()
    })
  }
  const setTxHash = (hash: Hex) => {
    tx = hash
    localStorage.setItem('bridge-tx', hash)
  }
  let usdMultiplier = $state(0n)
  const wplsTokenPrice = new SvelteMap<string, bigint>()
  const key = $derived(`${bridgeKey.toChain}-${bridgedToken?.address}`.toLowerCase())
  $effect(() => {
    const block = destination.block
    if (!block) return
    const watcher = watchWplsUSDPrice(block)
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
        ticker: destination.block!,
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
    'btn bg-tertiary-500 text-surface-contrast-950 h-16 rounded-none px-6 w-16 flex basis-auto' +
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
  let maxBridgeable = $state(0n)
  const disableBridgeButton = $derived(
    // bridgeStatus !== null ||
    !amountIn.value ||
      !minAmount.value ||
      amountIn.value < minAmount.value ||
      amountIn.value > maxBridgeable,
  )
  const destinationBlock = $derived(destination.block)
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
        const currentBlock = origination.block?.number
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

{#if tokenInput}
  <div
    class="w-full card preset-outline-surface-500 bg-surface-950-50 shadow-sm hover:shadow-lg transition-all duration-100 overflow-hidden">
    <header class="flex flex-row justify-between relative h-16">
      <div class="flex flex-col w-1/2 gap-0">
        <!-- input side -->
        {#if accountState.address}
          <div class="flex gap-1 flex-row-reverse absolute top-0 left-0">
            <BalanceReadout
              token={tokenInput}
              roundedClasses="rounded-tl"
              hideSymbol
              decimalLimit={9}
              onbalanceupdate={(balance) => {
                console.log('balance updated', balance)
                maxBridgeable = balance
              }}
              onmax={(balance) => {
                amountIn.value = balance
              }} />
          </div>
        {/if}
        <Button
          class="absolute size-6 bottom-0 left-0 flex justify-center items-center text-surface-contrast-50 group"
          onclick={toggleEditTxHash}>
          <Icon
            icon="mdi:pencil"
            class="w-full h-full p-1 text-surface-contrast-50 opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
        </Button>
        <label
          class="flex flex-row gap-1 w-full pl-4 pr-5 py-4 cursor-pointer text-surface-contrast-50 items-center group"
          for="amount-to-bridge">
          <div class="flex flex-col gap-0 w-full relative">
            <NumericInput
              id="amount-to-bridge"
              class="w-full text-base input py-0 px-0 ring-0 focus:ring-0 text-surface-contrast-50 text-right placeholder:text-gray-600 leading-6 h-8"
              value={bridgeAmount}
              decimals={tokenInput.decimals}
              oninput={(v) => {
                amountIn.value = v
              }} />
            <span
              class="text-xs w-full text-gray-500 text-right absolute -bottom-3 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none italic"
              >${usd.toCents(usdValueTokenAmount)}</span>
          </div>
          <span class="text-base">{tokenInput.symbol}</span>
          <TokenIcon src={assetSources(tokenInput)} />
        </label>
      </div>
      <VerticalDivider>
        <Icon
          icon="gridicons:chevron-right"
          class="text-surface-500 bg-surface-950-50 rounded-full w-full h-full ring-2 ring-current ring-inset p-0.5" />
      </VerticalDivider>
      <div
        class="flex flex-col w-1/2 text-surface-contrast-50 items-start justify-center relative cursor-not-allowed">
        {#if !bridgedToken}
          <span class="flex pl-6"><Loader /></span>
        {:else}
          <!-- output side -->
          <span
            class="flex flex-row items-center text-surface-contrast-50 w-full justify-end group min-h-[2rem]">
            <div class="pl-5 flex flex-row items-center min-w-0 flex-grow">
              <AssetWithNetwork asset={bridgedToken} network={Chains.PLS} />
              <span class="flex flex-row gap-2 items-center pl-1 min-w-0 flex-shrink relative">
                <span
                  class="flex flex-col gap-0 relative text-left min-w-0 flex-shrink overflow-hidden">
                  <span class="flex min-w-0 flex-shrink overflow-hidden items-center">
                    <span
                      class="text-ellipsis overflow-hidden whitespace-nowrap text-base flex-shrink min-w-0"
                      >{humanReadableNumber(outputAmount, {
                        decimals: bridgedToken.decimals,
                      })}</span>
                    <span class="whitespace-nowrap flex-shrink-0 mx-1 text-base"
                      >{bridgedToken.symbol}</span>
                  </span>
                </span>
                <span
                  class="text-xs w-full text-gray-500 absolute -bottom-3 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none italic"
                  >${usd.toCents(usdValueTokenAmount)}</span>
              </span>
            </div>
            <Button disabled={disableBridgeButton} class={bridgeGoClassNames} onclick={bridgeTokens}
              >Go</Button>
          </span>
        {/if}
      </div>
    </header>
    <footer
      class="shadow-inner h-0 transition-all duration-100 bg-surface-900-100 rounded-b"
      class:h-6={bridgeStatus !== null || editTxHash}>
      {#if editTxHash}
        <div class="h-6 flex flex-row items-center">
          <Button class="h-full w-8 bg-error-400 leading-6" onclick={toggleEditTxHash}
            >&times;</Button>
          <Input
            setref={(el) => {
              editTxInput = el
            }}
            class="h-full px-2 py-0 text-sm text-surface-contrast-50 w-full ring-0 focus:ring-0"
            roundedClass={'rounded-br'}
            value={editTxHashValue}
            oninput={(v) => {
              editTxHashValue = v
              if (editTxHashValue.length === 66 && isHex(editTxHashValue)) {
                setTxHash(editTxHashValue)
                editTxHash = false
              }
            }} />
        </div>
      {:else}
        <div
          class="flex flex-row items-center gap-1 h-full bg-success-500 justify-end min-w-[200px] text-sm transition-all duration-100 relative transition-delay-200"
          style="width: {percentProgress}%">
          <Button class="h-full w-8 absolute top-0 left-0 bg-error-400" onclick={clearTxTracking}
            >&times;</Button>
          <ExplorerLink path={`/tx/${tx}`} chain={bridgeKey.fromChain} size="1.5em" />
          <Button
            class="btn h-full p-0 capitalize flex-row gap-2 hover:filter-none text-sm font-inter"
            onclick={incrementBridgeStatus}>
            <Loading key="bridge-status-check" />
            <span class="text-surface-contrast-950">{bridgeStatus?.status?.toLowerCase()}</span>
          </Button>
          {#if bridgeStatus?.status !== bridgeStatuses.AFFIRMED && bridgeStatusETATooltip}
            <Tooltip
              placement="top"
              tooltip={bridgeStatusETATooltip}
              class="pr-1 items-center justify-center">
              <Icon icon="mdi:clock" class="size-6 p-1 pointer-events-none" />
            </Tooltip>
          {/if}
          {#if bridgeStatus?.status === bridgeStatuses.AFFIRMED && bridgeStatus.deliveredHash}
            <span class="h-full w-8 flex items-center justify-start">
              <ExplorerLink
                path={`/tx/${bridgeStatus.deliveredHash}`}
                chain={bridgeKey.toChain}
                size="1.5em" />
            </span>
          {/if}
        </div>
      {/if}
    </footer>
  </div>
{/if}

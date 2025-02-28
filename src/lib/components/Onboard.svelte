<script lang="ts">
  import TokenIcon from './TokenIcon.svelte'
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress, type Hex } from 'viem'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import TokenInfo from './TokenInfo.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { Chains, Provider } from '$lib/stores/auth/types'
  import {
    accountState,
    modal,
    switchNetwork,
    wagmiAdapter,
  } from '$lib/stores/auth/AuthProvider.svelte'
  import ConnectButton from './ConnectButton.svelte'
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
    ChainState,
    loadAssetLink,
    loadPrice,
    minAmount,
    priceInt,
    watchWplsUSDPrice,
    liveBridgeStatus,
    type BridgeStatus,
    bridgeStatuses,
    type ContinuedLiveBridgeStatusParams,
  } from '$lib/stores/chain-events.svelte'
  import {
    amountIn,
    bridgableTokens,
    bridgeableTokensUnder,
    bridgeFee,
    loadFeeFor,
    recipient,
    bridgeKey,
    BridgeKeyStore,
  } from '$lib/stores/input.svelte'
  import { humanReadableNumber } from '$lib/stores/utils'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import Image from './Image.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { SvelteMap } from 'svelte/reactivity'
  import { sendTransaction, waitForTransaction, waitForTransactionReceipt } from '@wagmi/core'
  import Loading from './Loading.svelte'
  import _ from 'lodash'
  import Tooltip from './Tooltip.svelte'
  let tokenOutput = $state<Token>({
    logoURI: `https://gib.show/image/369/${zeroAddress}`,
    name: 'Pulse',
    symbol: 'PLS',
    decimals: 18,
    chainId: 369,
    address: zeroAddress,
  })
  const bridgedToken = $derived(bridgeSettings.assetOut.value as Token | null)
  const updateTokenInput = (token: Token) => {
    bridgeSettings.assetIn.value = token
  }
  const updateTokenOutput = (token: Token) => {
    tokenOutput = token
  }
  const openOnRamp = () => {
    modal.open({
      view: 'OnRampProviders',
    })
  }
  const openBridge = () => {
    modal.open({
      view: 'Swap',
    })
  }
  // let bridgeAmount = $state(0n)
  const bridgeAmount = $derived(amountIn.value ?? 0n)
  const bridgeFeePercent = $derived(bridgeFee.value?.feeF2H ?? 0n)
  const bridgeFeeAmount = $derived((bridgeFeePercent * bridgeAmount) / oneEther)
  const outputAmount = $derived(bridgeAmount - bridgeFeeAmount)
  const tokenInput = $derived(bridgeSettings.assetIn.value)
  $effect.pre(() => {
    bridgeKey.value = [Provider.PULSECHAIN, Chains.ETH, Chains.PLS]
  })
  const networkMatches = $derived(accountState.chainId === Number(bridgeKey.fromChain))
  $effect(() => {
    if (!tokenInput) {
      bridgeSettings.assetIn.value = {
        logoURI: `https://gib.show/image/1/${zeroAddress}`,
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        chainId: 1,
        address: zeroAddress,
      }
    }
  })
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
  let tx: Hex | null = $state((localStorage.getItem('bridge-tx') as Hex) ?? null)
  const bridgeTokens = async () => {
    if (!accountState.address) return
    tx = await sendTransaction(wagmiAdapter.wagmiConfig, {
      account: accountState.address,
      ...bridgeSettings.transactionInputs,
    })
    localStorage.setItem('bridge-tx', tx)
    incrementBridgeStatus()
    waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
      hash: tx,
    }).then(() => {
      incrementBridgeStatus()
    })
  }
  const targetChain = $derived(chainsMetadata[bridgeKey.fromChain])
  const switchToTargetChain = () => {
    modal.open({
      view: 'Networks',
    })
  }
  let usdMultiplier = $state(0n)
  const wplsTokenPrice = new SvelteMap<string, bigint>()
  const key = $derived(`${bridgeKey.toChain}-${bridgedToken?.address}`.toLowerCase())
  const zeroUsdValue = '0.00'
  const destination = new ChainState()
  $effect(() => destination.watch(bridgeKey.toChain))
  $effect(() => {
    const block = destination.block
    if (!block) return
    const watcher = watchWplsUSDPrice(block)
    watcher.promise.then((price) => {
      if (watcher.controller.signal.aborted) {
        // console.log('aborted')
        return
      }
      usdMultiplier = price ?? 0n
    })
    return watcher.cleanup
  })
  $effect(() => {
    const block = destination.block
    if (!bridgedToken || !block) return
    const price = loadPrice(bridgedToken, block)
    price.promise
      .then((priceResult) => {
        if (price.controller.signal.aborted) {
          return
        }
        if (!priceResult) {
          wplsTokenPrice.set(key, 0n)
        } else {
          const price = priceInt(priceResult, bridgedToken.decimals)
          wplsTokenPrice.set(key, price)
        }
      })
      .catch(() => {
        wplsTokenPrice.set(key, 0n)
      })
    return price.cleanup
  })
  const priceAsInt = $derived(wplsTokenPrice.get(key) ?? 0n)
  const usdValueInt = $derived(
    priceAsInt && usdMultiplier ? ((priceAsInt ?? 0n) * 10n ** 18n) / usdMultiplier : 0n,
  )
  const usdValueTokenAmount = $derived(
    !amountIn.value
      ? 0n
      : (usdValueInt * amountIn.value) / 10n ** BigInt(tokenInput?.decimals ?? 18),
  )
  let bridgeStatus = $state<ContinuedLiveBridgeStatusParams | null>(null)
  // test situation
  $effect(
    _.once(() => {
      incrementBridgeStatus()
    }),
  )
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
    'btn bg-tertiary-500 text-surface-contrast-950 h-16 rounded-l-none px-6' +
      (bridgeStatus !== null ? ' rounded-b-none' : ' rounded-r'),
  )
  const percentProgress = $derived.by(() => {
    if (bridgeStatus === null) return 0
    switch (bridgeStatus.status) {
      case bridgeStatuses.SUBMITTED:
        return 20
      case bridgeStatuses.MINED:
        return 40
      case bridgeStatuses.FINALIZED:
        return 60
      case bridgeStatuses.VALIDATING:
        return 80
      case bridgeStatuses.AFFIRMED:
        return 100
    }
  })
  const clearTxTracking = () => {
    if (tx === localStorage.getItem('bridge-tx')) {
      localStorage.removeItem('bridge-tx')
      tx = null
    }
    bridgeStatus = null
  }
  const disableBridgeButton = $derived(
    bridgeStatus !== null ||
      !amountIn.value ||
      !minAmount.value ||
      amountIn.value < minAmount.value,
  )
  $effect(() => {
    if (!tx || !destination.block) return
    const result = liveBridgeStatus({
      bridgeKey,
      hash: tx,
      ticker: destination.block,
    })
    result.promise.then((liveResult) => {
      if (result.controller.signal.aborted) return
      bridgeStatus = liveResult ?? null
    })
    return result.cleanup
  })
  const bridgeStatusETATooltip = $derived.by(() => {
    switch (bridgeStatus?.status) {
      case bridgeStatuses.SUBMITTED:
        return 'This transaction is still being validated by the network.'
      case bridgeStatuses.MINED:
        return 'mined'
      case bridgeStatuses.FINALIZED:
        return '<20s'
      case bridgeStatuses.VALIDATING:
        return '<10s'
    }
    return null
  })
</script>

{#if !networkMatches}
  <div class="flex flex-row items-center justify-center gap-4">
    <Button class="btn preset-filled-tertiary-950-50 w-fit" onclick={switchToTargetChain}>
      <span>Switch Network</span>
      <Image src={targetChain.icon} alt={targetChain.name} class="size-4" />
    </Button>
  </div>
{:else if tokenInput}
  <div class="flex flex-col gap-4 max-w-2xl mx-auto w-full">
    <header class="flex flex-row justify-between">
      <div class="flex flex-row gap-2">
        <Button
          class="btn preset-tonal gap-1 shadow-inner border border-surface-100/20"
          onclick={openOnRamp}>
          <span>OnRamp</span>
          <Icon icon="material-symbols:ramp-left-rounded" mode="svg" class="size-6" />
        </Button>
        <Button
          class="btn preset-tonal gap-2 shadow-inner border border-surface-100/20"
          onclick={openBridge}>
          <span>Bridge</span>
          <Icon icon="icon-park-solid:bridge-one" mode="svg" class="size-6" />
        </Button>
      </div>
      <ConnectButton />
    </header>
    <div
      class="w-full card preset-outline-surface-500 bg-surface-950-50 shadow-sm hover:shadow-lg transition-all duration-100">
      <header class="flex flex-row justify-between relative">
        <!-- token that i have -->
        <div class="w-1/2 flex flex-col justify-end relative">
          <ModalWrapper
            wrapperClasses="w-full h-full"
            triggerClasses="p-4 flex relative justify-end w-full h-full items-center gap-2 text-surface-contrast-50 group">
            {#snippet button()}
              <span class="flex flex-row px-2 w-full">
                <TokenInfo token={tokenInput} truncate={8} reversed externalGroup />
              </span>
            {/snippet}
            {#snippet contents({ close })}
              <TokenSelect
                chain={Chains.ETH}
                onsubmit={(tkn) => {
                  updateTokenInput(tkn)
                  close()
                }} />
            {/snippet}
          </ModalWrapper>
        </div>
        <!-- vertical divider -->
        <VerticalDivider>
          <Icon
            icon="mdi:run"
            class="text-surface-500 bg-surface-950-50 rounded-full w-full h-full ring-2 ring-current ring-inset p-1" />
        </VerticalDivider>
        <!-- token that i want -->
        <div class="w-1/2 flex">
          <ModalWrapper
            wrapperClasses="w-full h-full"
            triggerClasses="p-4 flex relative justify-end w-full h-full items-center gap-2 text-surface-contrast-50 group">
            {#snippet button()}
              <span class="flex flex-row px-2 w-full">
                <TokenInfo token={tokenOutput} truncate={8} externalGroup />
              </span>
            {/snippet}
            {#snippet contents({ close })}
              <TokenSelect
                chain={Chains.PLS}
                onsubmit={(tkn) => {
                  updateTokenOutput(tkn)
                  close()
                }} />
            {/snippet}
          </ModalWrapper>
        </div>
      </header>
    </div>
    <div
      class="w-full card preset-outline-surface-500 bg-surface-950-50 shadow-sm hover:shadow-lg transition-all duration-100 overflow-hidden">
      <header class="flex flex-row justify-between relative">
        <div class="flex flex-col w-1/2 gap-0">
          {#if accountState.address}
            <div class="flex gap-1 flex-row-reverse absolute top-0 left-0">
              <BalanceReadout
                token={tokenInput}
                roundedClasses="rounded-tl"
                hideSymbol
                decimalLimit={9}
                onmax={(balance) => {
                  amountIn.value = balance
                }} />
            </div>
          {/if}
          <label
            class="flex flex-row gap-1 w-full pl-4 pr-6 py-4 cursor-pointer text-surface-contrast-50 items-center group"
            for="amount-to-bridge">
            <div class="flex flex-col gap-0 w-full relative">
              <NumericInput
                id="amount-to-bridge"
                class="w-full input py-0 px-0 ring-0 focus:ring-0 text-surface-contrast-50 text-right placeholder:text-gray-600 text-lg placeholder:text-lg leading-6 h-8"
                value={bridgeAmount}
                decimals={tokenInput.decimals}
                oninput={(v) => {
                  amountIn.value = v
                }} />
              <span
                class="text-xs w-full text-gray-500 text-right absolute -bottom-3 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                >${usdValueTokenAmount
                  ? humanReadableNumber(usdValueTokenAmount, { maxDecimals: 2 })
                  : zeroUsdValue}</span>
            </div>
            <span>{tokenInput.symbol}</span>
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
            <span
              class="flex flex-row items-center text-surface-contrast-50 w-full justify-end group">
              <span
                class="flex flex-row-reverse gap-2 items-center ml-6 w-full text-right relative">
                {#if accountState.address}
                  <div
                    class="flex flex-row absolute w-full right-2 pl-6 text-xs leading-6 text-gray-500 gap-1 -top-4 text-right justify-end">
                    <span>balance</span>
                    <BalanceReadout
                      token={bridgedToken}
                      hideSymbol
                      roundedClasses="rounded-md"
                      decimalClasses="opacity-60" />
                  </div>
                {/if}
                <span class="flex flex-col gap-0 relative w-full text-left">
                  <span
                    >{humanReadableNumber(outputAmount, {
                      decimals: bridgedToken.decimals,
                      maxDecimals: 9,
                    })}
                    {bridgedToken.symbol}</span>
                  <!-- <span class="text-xs text-gray-500"></span> -->
                  <span
                    class="text-xs w-full text-gray-500 absolute -bottom-3 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                    >${usdValueTokenAmount
                      ? humanReadableNumber(usdValueTokenAmount, { maxDecimals: 2 })
                      : zeroUsdValue}</span>
                </span>
                <AssetWithNetwork asset={bridgedToken} network={Chains.PLS} />
              </span>
              <Button
                disabled={disableBridgeButton}
                class={bridgeGoClassNames}
                onclick={bridgeTokens}>Go</Button>
            </span>
          {/if}
        </div>
      </header>
      <footer
        class="shadow-inner h-0 transition-all duration-100 bg-surface-900-100 rounded-b"
        class:h-6={bridgeStatus !== null}>
        <div
          class="flex flex-row items-center gap-1 h-full bg-success-500 justify-end min-w-[150px] text-sm transition-all duration-100 relative transition-delay-200"
          style="width: {percentProgress}%">
          <Button class="size-6 absolute top-0 left-0 bg-error-400" onclick={clearTxTracking}
            >&times;</Button>
          <Button
            class="btn h-full p-0 capitalize flex-row gap-2 hover:filter-none"
            onclick={incrementBridgeStatus}>
            <Loading key="bridge-status-check" />
            <span class="text-surface-contrast-950">{bridgeStatus?.status?.toLowerCase()}</span>
          </Button>
          {#if bridgeStatus?.status !== bridgeStatuses.AFFIRMED && bridgeStatusETATooltip}
            <Tooltip placement="top" tooltip={bridgeStatusETATooltip}>
              <Icon icon="mdi:clock" class="size-6 p-1 mr-1" />
            </Tooltip>
          {/if}
        </div>
      </footer>
    </div>
  </div>
{/if}

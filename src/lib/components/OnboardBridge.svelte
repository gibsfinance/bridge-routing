<script lang="ts">
  import * as transactions from '$lib/stores/transactions'
  import TokenIcon from './TokenIcon.svelte'
  import type { Token } from '$lib/types.svelte'
  import { isHex, zeroAddress, type Hex } from 'viem'
  import { Chains, idToChain, Provider } from '$lib/stores/auth/types'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import {
    assetOutKey,
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
    // bridgeableTokensUnder,
    // bridgeAdminSettings,
    loadFeeFor,
    recipient,
    bridgeKey,
  } from '$lib/stores/input.svelte'
  import { settings as bridgeAdminSettings } from '$lib/stores/fee-manager.svelte'
  // import { humanReadableNumber, usd } from '$lib/stores/utils'
  // import AssetWithNetwork from './AssetWithNetwork.svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import { untrack } from 'svelte'
  import {
    bridgeTxHash,
    foreignBridgeInputs,
    showTooltips,
    storage,
  } from '$lib/stores/storage.svelte'
  import InputOutputForm from './InputOutputForm.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import OnboardButton from './OnboardButton.svelte'
  import { availableChains } from '$lib/stores/lifi.svelte'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
  import { Progress, Tooltip } from '@skeletonlabs/skeleton-svelte'
  import ExplorerLink from './ExplorerLink.svelte'
  import Icon from '@iconify/svelte'
  import Button from './Button.svelte'
  import Input from './Input.svelte'
  import OnboardRadio from './OnboardRadio.svelte'
  import GuideShield from './GuideShield.svelte'
  import GuideStep from './GuideStep.svelte'

  const toast = getContext('toast') as ToastContext

  const bridgedToken = $derived(bridgeSettings.assetOut as Token | null)
  const bridgeAmount = $derived(amountIn.value ?? 0n)
  const bridgeFeePercent = $derived(bridgeAdminSettings.get(bridgeKey.value)?.feeF2H ?? 0n)
  const bridgeFeeAmount = $derived((bridgeFeePercent * bridgeAmount) / oneEther)
  const outputAmount = $derived(bridgeAmount - bridgeFeeAmount)
  const tokenInput = $derived(bridgeSettings.assetIn.value)

  let editTxHash = $state(false)
  $effect(() => {
    const assetOutputKey = assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: tokenInput?.address as Hex,
      unwrap: false,
    })
    if (!tokenInput || !assetOutputKey) return
    const tokensUnderBridgeKey = bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
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
      if (!assetOut) return
      bridgeSettings.setAssetOut(assetOutputKey, {
        ...assetOut,
        logoURI: tokenInput.logoURI,
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
    recipient.value = accountState.address ?? zeroAddress
  })
  let tx: Hex | null = $state(null)
  $effect(() => {
    tx = bridgeTxHash.value
  })
  const incrementApproval = transactionButtonPress({
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
    ],
  })
  const initiateBridge = transactionButtonPress({
    toast,
    steps: [
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
  const bridgeTokens = () => {
    if (needsApproval) return incrementApproval()
    return initiateBridge()
  }
  const needsApproval = $derived.by(() => {
    return (
      assetLink.value?.originationChainId === bridgeKey.fromChain ||
      !bridgeSettings.approval.value ||
      bridgeSettings.approval.value < bridgeSettings.amountToBridge
    )
  })
  // $inspect(
  //   needsApproval,
  //   assetLink.value?.originationChainId,
  //   bridgeSettings.approval.value,
  //   bridgeSettings.amountToBridge,
  // )
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
        bridgeKey: bridgeKey.value,
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
        status: bridgeStatuses.FINALIZED,
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
    const localTx = bridgeTxHash.value
    if (tx === localTx) {
      bridgeTxHash.value = null
      tx = null
    }
    bridgeStatus = null
  }
  let maxBridgeable = $state(0n as bigint | null)
  const disableBridgeButton = $derived(
    !maxBridgeable ||
      !amountIn.value ||
      !minAmount.value ||
      amountIn.value < minAmount.value ||
      amountIn.value > maxBridgeable,
  )
  // $inspect(disableBridgeButton, maxBridgeable, amountIn.value, minAmount.value)
  $effect(() => {
    if (!bridgeTxHash.value || !destinationBlock) {
      return
    }
    const result = liveBridgeStatus({
      bridgeKey: bridgeKey.value,
      hash: bridgeTxHash.value,
      ticker: destinationBlock,
    })
    result.promise.then((liveResult) => {
      if (result.controller.signal.aborted) return
      if (liveResult?.hash !== tx) {
        const local = bridgeTxHash.value
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
        if (lastTxHash === bridgeTxHash.value) {
          clearTxTracking()
        }
      }, 10_000)
    }
  })
  let showTxInput = $state(false)
  let txHashValue = $state('')
  $effect(() => {
    if (bridgeTxHash.value) {
      txHashValue = bridgeTxHash.value
    }
  })
  const toggleEditTxHash = () => {
    showTxInput = !showTxInput
  }
  const updateTxHash = (v: string) => {
    if (isHex(v) && v.length === 66) {
      bridgeTxHash.value = v as Hex
    }
  }
  const hideTxHashInput = () => {
    showTxInput = false
  }
  const isValidTxHash = $derived(isHex(txHashValue) && txHashValue.length === 66)
</script>

<InputOutputForm icon="line-md:chevron-double-down">
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
      {#snippet radio()}
        <OnboardRadio />
      {/snippet}
      {#snippet modal({ close })}
        <TokenSelect
          chains={[Number(Chains.ETH)]}
          selectedChain={Number(bridgeKey.fromChain)}
          tokens={bridgableTokens.bridgeableTokensUnder({
            provider: Provider.PULSECHAIN,
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
      readonlyInput
      readonlyTokenSelect
      value={outputAmount}
      onbalanceupdate={() => {}}>
      {#snippet underinput()}
        <Button
          onclick={toggleEditTxHash}
          class="opacity-0 hover:opacity-100 transition-opacity duration-100 text-surface-contrast-50 absolute top-full left-0">
          <Icon icon="mdi:pencil" class="size-4 flex" />
        </Button>
      {/snippet}
    </SectionInput>
  {/snippet}
  {#snippet button()}
    <OnboardButton
      disabled={disableBridgeButton}
      requiredChain={idToChain.get(tokenInput!.chainId)!}
      onclick={bridgeTokens}
      text={needsApproval ? 'Approve' : 'Bridge to PulseChain'}
      loadingKey="lifi-quote" />
  {/snippet}
  {#snippet progress()}
    {#if showTxInput}
      <div class="h-6 w-full relative">
        <Button
          onclick={hideTxHashInput}
          class="text-sm text-contrast-500 text-right absolute top-0 leading-6 flex flex-col gap-1 items-center justify-center size-6 text-surface-contrast-50">
          <Icon icon="flowbite:close-outline" class="size-4 flex [&>path]:stroke-2" />
        </Button>
        <Input
          value={txHashValue}
          oninput={(val) => {
            updateTxHash(val)
            if (isHex(val) && val.length === 66) {
              showTxInput = false
            }
          }}
          class="border pl-6 pr-2 py-1 rounded-full text-xs h-full text-ellipsis text-surface-contrast-50 text-right focus:ring-0 {isValidTxHash
            ? 'border-success-500'
            : 'border-error-200'}" />
      </div>
    {:else if bridgeStatus}
      <div class="flex flex-row w-full relative grow">
        <Progress
          height="h-6"
          meterBg="bg-success-500"
          trackClasses="flex rounded-full overflow-hidden inset-shadow-sm border border-success-500"
          value={percentProgress ?? 30}
          max={100} />
        <span
          class="text-sm text-contrast-500 text-right absolute top-0 leading-6 -translate-x-full flex flex-row gap-1 items-center px-2"
          style:left={`${percentProgress}%`}>
          <ExplorerLink
            path={`/tx/${bridgeStatus?.hash}`}
            chain={Number(bridgeKey.fromChain)}
            class="size-6 flex" />
          <span>{bridgeStatus?.status}</span>
          {#if bridgeStatus?.status === bridgeStatuses.AFFIRMED}
            <ExplorerLink
              path={`/tx/${bridgeStatus?.hash}`}
              chain={Number(bridgeKey.toChain)}
              class="size-6 flex" />
          {:else}
            <Tooltip
              interactive={false}
              triggerClasses="flex"
              contentClasses="flex bg-tertiary-500 rounded-lg px-2 py-1"
              openDelay={0}
              closeDelay={0}
              positioning={{ placement: 'top' }}>
              {#snippet trigger()}
                <Icon icon="mdi:clock" class="size-4 flex" />
              {/snippet}
              {#snippet content()}
                <span>{bridgeStatusETATooltip}</span>
              {/snippet}
            </Tooltip>
          {/if}
        </span>
        <Button
          onclick={clearTxTracking}
          class="text-sm text-contrast-500 text-right absolute top-0 leading-6 flex flex-row gap-1 items-center size-6 px-1 py-0.5">
          <Icon icon="mdi:close" class="size-5 flex" />
        </Button>
      </div>
    {/if}
  {/snippet}
</InputOutputForm>

{#if showTooltips.value}
  <div class="absolute top-0 left-0 w-full h-full">
    <GuideShield show={true} />
    <GuideStep step={1} triggerClass="absolute top-9 right-5">
      <p>Select the token you wish to bridge to Pulsechain.</p>
    </GuideStep>
    <GuideStep step={2} triggerClass="absolute top-24 left-5">
      <p>Set an amount to bridge.</p>
    </GuideStep>
    <GuideStep step={3} triggerClass="absolute left-0 right-0 mx-auto bottom-5">
      <p>Initiate the bridge.</p>
    </GuideStep>
  </div>
{/if}

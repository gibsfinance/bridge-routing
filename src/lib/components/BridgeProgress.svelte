<script lang="ts">
  import { isHex, type Hex } from 'viem'
  import { bridgeTx, type BridgeTx } from '$lib/stores/storage.svelte'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import Input from './Input.svelte'
  import { Progress } from '@skeletonlabs/skeleton-svelte'
  import ExplorerLink from './DirectLink.svelte'
  import {
    liveBridgeStatus,
    bridgeStatuses,
    type ContinuedLiveBridgeStatusParams,
    latestBlock,
    blocks,
  } from '$lib/stores/chain-events.svelte'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { Tooltip } from '@skeletonlabs/skeleton-svelte'
  import { untrack } from 'svelte'
  import Loader from './Loader.svelte'
  import { Chains } from '$lib/stores/auth/types'

  const destinationBlock = $derived(blocks.get(Number(bridgeKey.toChain)))
  let txInputValue = $state<Hex | null>(null)
  $effect(() => {
    if (bridgeTx.value?.hash) {
      txInputValue = bridgeTx.value?.hash
    }
  })
  let bridgeStatus = $state<ContinuedLiveBridgeStatusParams | null>(null)
  const percentProgress = $derived.by(() => {
    if (bridgeStatus === null) return 0
    switch (bridgeStatus.status) {
      case bridgeStatuses.SUBMITTED:
        return 30
      case bridgeStatuses.MINED:
        return 50
      case bridgeStatuses.FINALIZED:
        return 75
      // add this in to show partial signing
      // case bridgeStatuses.VALIDATING:
      //   return 90
      case bridgeStatuses.AFFIRMED:
        return 100
    }
  })
  const bridgeTxHash = $derived(bridgeTx.value?.hash ?? null)
  const clearTxTracking = () => {
    const localTx = bridgeTxHash
    if (txInputValue === localTx) {
      bridgeTx.extend({
        hash: null,
      })
      txInputValue = null
    }
    bridgeStatus = null
  }
  $effect(() => latestBlock(Number(Chains.PLS)))
  const latestPulsechainBlockObject = $derived(blocks.get(Number(Chains.PLS)))
  const gasIsHigh = $derived(
    !!latestPulsechainBlockObject &&
      latestPulsechainBlockObject.baseFeePerGas! > 20_000_000n * 10n ** 9n,
  )
  $effect(() => {
    const hash = bridgeTxHash
    if (!hash || !destinationBlock) {
      return
    }
    const result = liveBridgeStatus({
      bridgeKey: bridgeKey.value,
      hash,
      ticker: destinationBlock,
    })
    result.promise.then((liveResult) => {
      if (result.controller.signal.aborted) return
      if (liveResult?.hash !== txInputValue) {
        if (!hash) return
        txInputValue = hash
      }
      console.log(liveResult)
      bridgeStatus = liveResult ?? null
    })
    return result.cleanup
  })
  const fromChainLatestBlock = $derived(blocks.get(Number(bridgeKey.fromChain)))
  const bridgeStatusETATooltip = $derived.by(() => {
    const slotCount = 32n
    const blockTime = 12n
    if (bridgeStatus?.status === bridgeStatuses.SUBMITTED) {
      return 'This transaction is still being validated by the network.'
    } else if (bridgeStatus?.status === bridgeStatuses.MINED) {
      const currentlyFinalizedBlock = bridgeStatus?.finalizedBlock?.number
      const currentBlock = fromChainLatestBlock?.number
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
    } else if (bridgeStatus?.status === bridgeStatuses.FINALIZED) {
      return '<20s'
    } else if (bridgeStatus?.status === bridgeStatuses.VALIDATING) {
      return '<10s'
    }
    return null
  })
  $effect(() => {
    if (bridgeStatus?.status === bridgeStatuses.AFFIRMED) {
      const lastTxHash = untrack(() => bridgeStatus?.hash)
      setTimeout(() => {
        if (lastTxHash === bridgeTx.value?.hash) {
          clearTxTracking()
        }
      }, 10_000)
    }
  })
  const updateTxHash = (v: string, extension?: Partial<BridgeTx>) => {
    if (txHashIsValid(v)) {
      bridgeTx.extend({
        hash: v as Hex,
        ...extension,
      })
    }
  }
  const hideTxHashInput = () => {
    bridgeTx.extend({
      showEdit: false,
    })
  }
  const showTxInput = $derived(bridgeTx.value?.showEdit ?? false)
  const txHashIsValid = (v: string | null) => !!v && v.length === 66 && isHex(v)
  const isValidTxHash = $derived(txHashIsValid(txInputValue))
</script>

{#if showTxInput}
  <div class="h-6 w-full relative">
    <Button
      onclick={hideTxHashInput}
      class="text-sm text-contrast-500 text-right absolute top-0 leading-6 flex flex-col gap-1 items-center justify-center size-6 text-surface-contrast-50">
      <Icon icon="flowbite:close-outline" class="size-4 flex [&>path]:stroke-2" />
    </Button>
    <Input
      value={txInputValue}
      oninput={(val) => {
        updateTxHash(val, {
          showEdit: false,
        })
      }}
      class="border pl-6 pr-2 py-1 rounded-full text-xs h-full text-ellipsis text-surface-contrast-50 text-right focus:ring-0 {isValidTxHash
        ? 'border-success-500'
        : 'border-error-200'}" />
  </div>
{:else if bridgeTx.value?.hash}
  <div class="flex flex-row w-full relative grow">
    {#if !bridgeStatus}
      <Loader class="h-full text-gray-500 absolute right-0 left-0 m-auto" />
    {/if}
    <Progress
      height="h-6"
      meterBg={gasIsHigh ? 'bg-warning-400' : 'bg-success-500'}
      trackClasses="flex rounded-full overflow-hidden inset-shadow-sm border {gasIsHigh
        ? 'border-warning-400'
        : 'border-success-500'}"
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
      {#if gasIsHigh}
        <Tooltip
          interactive={false}
          triggerClasses="flex"
          contentClasses="flex bg-tertiary-500 rounded-lg px-2 py-1"
          openDelay={0}
          closeDelay={0}
          positioning={{ placement: 'top' }}>
          {#snippet trigger()}
            <Icon icon="material-symbols:help" class="size-4 flex" />
          {/snippet}
          {#snippet content()}
            <span>Gas is currently high, this will probably take longer than expected.</span>
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

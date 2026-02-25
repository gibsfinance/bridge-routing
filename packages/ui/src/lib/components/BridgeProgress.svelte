<script lang="ts">
  import { isHex, type Hex } from 'viem'
  import { untrack } from 'svelte'
  import { Chains } from '@gibs/bridge-sdk/config'
  import { pathway } from '@gibs/bridge-sdk/config'
  import type { BridgeKey } from '@gibs/bridge-sdk/types'
  import Icon from '@iconify/svelte'
  import { Progress } from '@skeletonlabs/skeleton-svelte'

  import {
    liveBridgeStatus,
    bridgeStatuses,
    type ContinuedLiveBridgeStatusParams,
    latestBlock,
    blocks,
  } from '../stores/chain-events.svelte'
  import { bridgeTx, type BridgeTx } from '../stores/storage.svelte'
  import { bridgeKey } from '../stores/input.svelte'

  import Button from './Button.svelte'
  import Input from './Input.svelte'
  import DirectLink from './DirectLink.svelte'
  import Tooltip from './Tooltip.svelte'
  import Loader from './Loader.svelte'
    import { isProd } from '../stores/config.svelte'
  import { bridgeETA } from '../stores/utils'

  type BridgeProgressProps = {
    oncomplete?: () => void
  }

  const { oncomplete }: BridgeProgressProps = $props()

  const originationChain = $derived(blocks.get(Number(bridgeKey.fromChain)))
  let txInputValue = $state<Hex | null>(null)
  $effect(() => {
    if (bridgeTx.value?.hash) {
      txInputValue = bridgeTx.value?.hash
    }
  })
  let bridgeStatus = $state<ContinuedLiveBridgeStatusParams | null>(null)
  let isLoadingStatus = $state(false)
  const percentProgress = $derived.by(() => {
    if (bridgeStatus === null) return 0
    switch (bridgeStatus.status) {
      case bridgeStatuses.SUBMITTED:
        return 40
      case bridgeStatuses.MINED:
        return 55
      case bridgeStatuses.FINALIZED:
        return 75
      case bridgeStatuses.VALIDATING:
        return 90
      case bridgeStatuses.AFFIRMED:
      case bridgeStatuses.DELIVERED:
        return 100
      default:
        // Unknown status - show partial progress
        return 30
    }
  })
  const bridgeTxHash = $derived(bridgeTx.value?.hash ?? null)
  const clearTxTracking = () => {
    const localTx = bridgeTxHash
    if (txInputValue === localTx) {
      bridgeTx.extend({
        hash: null,
        chainId: null,
      })
      txInputValue = null
    }
    untrack(() => {
      bridgeStatus = null
      isLoadingStatus = false
    })
  }

  // Watch for PulseChain blocks (for gas price indicator)
  $effect(() => {
    const cleanup = latestBlock(Number(Chains.PLS))
    return cleanup
  })

  const latestPulsechainBlockObject = $derived(blocks.get(Number(Chains.PLS)))
  const gasIsHigh = $derived(
    !!latestPulsechainBlockObject?.get('latest')?.block &&
      latestPulsechainBlockObject.get('latest')!.block!.baseFeePerGas! > 20_000_000n * 10n ** 9n,
  )

  // Store cleanup outside effect to ensure it's always called
  let statusCleanup: (() => void) | null = null

  $effect(() => {
    // Always cleanup previous before starting new
    statusCleanup?.()
    statusCleanup = null

    const hash = bridgeTxHash
    const bridgeKeyValue = bridgeTx.value?.bridgeKey as BridgeKey
    const ticker = originationChain?.get('latest')?.block

    if (!hash || !originationChain || !bridgeKeyValue || !ticker) {
      // Clear status when dependencies go away
      untrack(() => {
        bridgeStatus = null
        isLoadingStatus = false
      })
      return
    }

    // Set loading state
    untrack(() => {
      isLoadingStatus = true
    })

    const result = liveBridgeStatus({
      bridgeKey: bridgeKeyValue,
      hash,
      ticker,
    })

    statusCleanup = result.cleanup

    result.promise.then((liveResult) => {
      if (result.controller.signal.aborted) return

      // Use untrack to prevent re-triggering this effect
      untrack(() => {
        // Only update txInputValue if it's currently showing the tracked hash
        // Don't override if user manually entered a different hash
        if (txInputValue === hash || !txInputValue) {
          txInputValue = hash
        }
        bridgeStatus = liveResult ?? null
        isLoadingStatus = false
      })
    }).catch((error) => {
      console.error('Bridge status fetch failed:', error)
      untrack(() => {
        isLoadingStatus = false
      })
    })

    // Return cleanup
    return () => {
      statusCleanup?.()
      statusCleanup = null
    }
  })
  const fromChainLatestBlocks = $derived(blocks.get(Number(bridgeKey.fromChain)))
  const bridgeStatusETATooltip = $derived.by(() => {
    return bridgeETA.calculateETA({
      bridgeStatus,
      fromChainBlocks: fromChainLatestBlocks,
    })
  })

  // Auto-clear when affirmed (with cleanup to prevent memory leaks)
  let autoClearTimeout: ReturnType<typeof setTimeout> | null = null
  $effect(() => {
    // Clear previous timeout
    if (autoClearTimeout !== null) {
      clearTimeout(autoClearTimeout)
      autoClearTimeout = null
    }

    if (bridgeStatus?.status === bridgeStatuses.AFFIRMED) {
      const lastTxHash = bridgeStatus?.hash
      autoClearTimeout = setTimeout(() => {
        // Only clear if this is still the current transaction
        if (lastTxHash === bridgeTx.value?.hash) {
          clearTxTracking()
          oncomplete?.()
        }
      }, 10_000)
    }

    // Cleanup on effect re-run or unmount
    return () => {
      if (autoClearTimeout !== null) {
        clearTimeout(autoClearTimeout)
        autoClearTimeout = null
      }
    }
  })
  const updateTxHash = (v: string, extension?: Partial<BridgeTx>) => {
    if (txHashIsValid(v)) {
      bridgeTx.extend({
        hash: v as Hex,
        bridgeKey: bridgeKey.value.slice(0) as BridgeKey,
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
      class="text-sm text-contrast-500 text-right absolute top-0 leading-6 flex flex-col gap-1 items-center justify-center size-6 text-surface-50">
      <Icon icon="flowbite:close-outline" class="size-4 flex [&>path]:stroke-2" />
    </Button>
    <Input
      value={txInputValue}
      oninput={(val) => {
        updateTxHash(val, {
          showEdit: false,
        })
      }}
      class="border pl-6 pr-2 py-1 rounded-full text-xs h-full text-ellipsis text-surface-50 text-right focus:ring-0 {isValidTxHash
        ? 'border-success-500'
        : 'border-error-200'}"
      autoFocus />
  </div>
{:else if bridgeTx.value?.hash}
  <div class="flex flex-row w-full relative grow">
    {#if isLoadingStatus || !bridgeStatus}
      <div class="absolute right-0 left-0 top-0 bottom-0 flex items-center justify-center z-10">
        <Loader class="h-full text-gray-500" />
      </div>
    {/if}
    <Progress
      height="h-6"
      meterBg={gasIsHigh ? 'bg-warning-400' : 'bg-success-500'}
      trackClasses="flex rounded-full overflow-hidden inset-shadow-sm border -mt-[1px] {isLoadingStatus
        ? 'opacity-50'
        : ''} {gasIsHigh
        ? 'border-warning-400'
        : 'border-success-500'}"
      value={percentProgress}
      trackBg="bg-surface-200"
      max={100} />
    <span
      class="text-sm text-contrast-500 text-right absolute top-0 leading-6 -translate-x-full flex flex-row gap-1 items-center px-2"
      style:left={`${percentProgress}%`}>
      <DirectLink
        path={`/tx/${bridgeStatus?.hash}`}
        chain={Number(bridgeKey.fromChain)}
        class="size-6 flex" />
      <span>{bridgeStatus?.status}</span>
      {#if bridgeStatus?.status === bridgeStatuses.AFFIRMED}
        {@const path = pathway(bridgeKey.value, isProd.value, bridgeTx.value?.hash)}
        {@const toHome = path?.toHome}
        <!-- affirmation complete events only show up on the home chain -->
        {@const affirmationCompleteChain = toHome ? bridgeKey.fromChain : bridgeKey.toChain}
        <DirectLink
          path={`/tx/${bridgeStatus?.deliveredHash}`}
          chain={Number(affirmationCompleteChain)}
          class="size-6 flex" />
      {:else}
        <Tooltip placement="top" gutter={3}>
          {#snippet trigger()}
            <Icon icon="mdi:clock" class="size-4 flex" />
          {/snippet}
          {#snippet content()}
            <span>{bridgeStatusETATooltip}</span>
          {/snippet}
        </Tooltip>
      {/if}
      {#if gasIsHigh}
        <Tooltip placement="top">
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

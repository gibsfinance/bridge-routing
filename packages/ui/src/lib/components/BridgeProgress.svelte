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
  const percentProgress = $derived.by(() => {
    if (bridgeStatus === null) return 0
    switch (bridgeStatus.status) {
      case bridgeStatuses.SUBMITTED:
        return 40
      case bridgeStatuses.MINED:
        return 55
      case bridgeStatuses.FINALIZED:
        return 75
      // add this in to show partial signing
      case bridgeStatuses.VALIDATING:
        return 90
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
        chainId: null,
      })
      txInputValue = null
    }
    bridgeStatus = null
  }
  $effect(() => latestBlock(Number(Chains.PLS)))
  const latestPulsechainBlockObject = $derived(blocks.get(Number(Chains.PLS)))
  const gasIsHigh = $derived(
    !!latestPulsechainBlockObject?.get('latest')?.block &&
      latestPulsechainBlockObject.get('latest')!.block!.baseFeePerGas! > 20_000_000n * 10n ** 9n,
  )
  $effect(() => {
    const hash = bridgeTxHash
    const bridgeKey = bridgeTx.value?.bridgeKey as BridgeKey
    const ticker = originationChain?.get('latest')?.block
    if (!hash || !originationChain || !bridgeKey || !ticker) {
      return
    }
    const result = liveBridgeStatus({
      bridgeKey,
      hash,
      ticker,
    })
    result.promise.then((liveResult) => {
      if (result.controller.signal.aborted) return
      if (liveResult?.hash !== txInputValue) {
        if (!hash) return
        txInputValue = hash
      }
      bridgeStatus = liveResult ?? null
    })
    return result.cleanup
  })
  const fromChainLatestBlocks = $derived(blocks.get(Number(bridgeKey.fromChain)))
  const bridgeStatusETATooltip = $derived.by(() => {
    return bridgeETA.calculateETA({
      bridgeStatus,
      fromChainBlocks: fromChainLatestBlocks,
    })
  })
  $effect(() => {
    if (bridgeStatus?.status === bridgeStatuses.AFFIRMED) {
      const lastTxHash = untrack(() => bridgeStatus?.hash)
      setTimeout(() => {
        if (lastTxHash === bridgeTx.value?.hash) {
          clearTxTracking()
          oncomplete?.()
        }
      }, 10_000)
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
        : 'border-error-200'}"
      autoFocus />
  </div>
{:else if bridgeTx.value?.hash}
  <div class="flex flex-row w-full relative grow">
    {#if !bridgeStatus}
      <Loader class="h-full text-gray-500 absolute right-0 left-0 m-auto" />
    {/if}
    <Progress
      height="h-6"
      meterBg={gasIsHigh ? 'bg-warning-400' : 'bg-success-500'}
      trackClasses="flex rounded-full overflow-hidden inset-shadow-sm border -mt-[1px] {gasIsHigh
        ? 'border-warning-400'
        : 'border-success-500'}"
      value={percentProgress ?? 30}
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

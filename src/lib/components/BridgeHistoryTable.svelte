<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { Chains, toChain, toChainKey, type VisualChain } from '$lib/stores/auth/types'
  import { finalizedBlocks } from '$lib/stores/chain-events'
  import type { Bridge } from '$lib/stores/history'
  import { ellipsis, humanReadableDate } from '$lib/stores/utils'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import ExplorerLink from './ExplorerLink.svelte'
  import Icon from '@iconify/svelte'
  import { deliverBridge } from '$lib/stores/delivery'
  import { useAuth } from '$lib/stores/auth/methods'
  import { fromChainId, provider } from '$lib/stores/input'
  import { goto } from '$app/navigation'
  import { get } from 'svelte/store'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { isAddress, zeroAddress, type Hex } from 'viem'
  import Tooltip from './Tooltip.svelte'
  import Hover from './Hover.svelte'
  import { hover } from '$lib/modifiers/hover'
  import { findAssetByUnique } from '$lib/stores/bridge-settings'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  export let bridges: Bridge[] = []
  const network = (chainId: string | number | undefined) => {
    const net = chainsMetadata[toChain(chainId!)] as VisualChain
    if (!net) {
      console.log('no net', chainId)
    }
    return net
  }
  const getBridgeStatus = (bridge: Bridge) => {
    const chainId = toChain(bridge!.bridge!.chainId)
    if (bridge.delivery?.transaction?.hash) {
      return 'Delivered'
    }
    if (bridge.confirmedSignatures!.items!.length >= Number(bridge.requiredSignatures!.value)) {
      return 'Signed'
    }
    if (bridge.transaction!.block!.number <= ($finalizedBlocks[chainId] || 0n)) {
      return 'Finalized'
    }
    return 'Pending'
  }
  // display / decimal / data length
  $: dL = 6
  let opened: Record<string, boolean> = {}

  const { switchChain } = useAuth()
  type Detail = {
    headline: string
    type: 'text' | 'address' | 'duration' | 'timestamp'
    body: string
    src?: string
    startTime?: Date
    endTime?: Date | null
  }

  let details: Detail[] = []
  let currentDetailSetting: number | null = null
  const showBridgeStepInfo = (bridge: Bridge, step: number) => {
    if (currentDetailSetting === step) {
      return
    }
    let d: Detail[] = []
    if (step === 4) {
      // console.log('bridge', bridge, step)
    } else if (step === 3) {
      // console.log('bridge', bridge, step)
      // step 3
    } else if (step === 2) {
      // console.log('bridge', bridge, step)
      // step 2
    } else if (step === 1) {
      // step 1
      // console.log('bridge', bridge, step)
      d.push({ headline: 'From', body: bridge.from || '', type: 'address' })
      d.push({
        headline: 'Token',
        body: bridge.token || '',
        type: 'address',
      })
      d.push({
        headline: 'Start Time',
        type: 'timestamp',
        body: humanReadableDate(new Date(Number(bridge.transaction!.block!.timestamp) * 1_000)),
        startTime: new Date(Number(bridge.transaction!.block!.timestamp) * 1_000),
      })
    } else if (step === 0) {
      // default - not hovering
      d.push({ headline: 'From', body: bridge.from || '', type: 'address' })
      d.push({
        headline: 'Token',
        body: bridge.token || '',
        type: 'address',
      })
      d.push({
        headline: 'Duration',
        type: 'duration',
        body: '',
        startTime: new Date(Number(bridge.transaction!.block!.timestamp) * 1_000),
        endTime: bridge.delivery?.transaction?.block?.timestamp
          ? new Date(Number(bridge.delivery?.transaction?.block?.timestamp) * 1_000)
          : null,
      })
    }
    console.log('d', d, step)
    currentDetailSetting = step
    details = d
    return d
  }
  const assetFromBridge = (bridge: Bridge) => {
    return findAssetByUnique(
      bridge.originationChainId,
      bridge.destinationChainId,
      bridge.token as Hex,
    )
    //  || {
    //   chainId: Number(bridge.originationChainId),
    //   address: bridge.token as Hex,
    //   name: '',
    //   symbol: '',
    //   decimals: 0,
    //   extensions: {
    //     bridgeInfo: {},
    //   },
    // }
  }
</script>

<div
  class="max-w-4xl flex flex-col items-center justify-center bg-white rounded-lg px-4 py-4 shadow">
  <div class="flex flex-row">
    <div class="flex flex-row gap-4 font-bold leading-8">
      <span class="text-left w-48">From</span>
      <span class="text-left w-24">Origination</span>
      <span class="text-center w-28">Status</span>
      <span class="text-left w-36">Destination</span>
      <span class="text-right w-8"></span>
    </div>
  </div>
  <div class="flex flex-col items-center justify-center">
    {#each bridges as bridge}
      <Hover let:handlers let:hovering>
        <!-- {@const _info = hovering ? '' : showBridgeStepInfo(bridge, 0)} -->
        {@const status = getBridgeStatus(bridge)}
        {@const isDelivered = !!bridge.delivery?.transaction?.hash}
        {@const initiationSeconds = Number(bridge.transaction?.block?.timestamp)}
        {@const originationChainId = toChain(bridge.originationChainId)}
        {@const requiredSigs = bridge.requiredSignatures?.value}
        {@const step2Complete =
          status === 'Finalized' || status === 'Signed' || status === 'Delivered'}
        {@const step3Complete = status === 'Signed' || status === 'Delivered'}
        {@const step4Complete = status === 'Delivered'}
        {@const asset = assetFromBridge(bridge)}
        <div
          class="flex flex-col"
          use:hover={{
            enter: handlers.enter,
            leave: () => {
              showBridgeStepInfo(bridge, 0)
              handlers.leave()
            },
          }}>
          <div class="flex flex-row w-full h-10 gap-4">
            <span class="flex flex-row w-48 items-center">
              <span class="font-mono"
                >{ellipsis(bridge.from || '', { length: dL, prefixLength: 2 })}</span>
            </span>
            <span class="flex flex-row w-24">
              <div class="flex flex-row items-center gap-2">
                <StaticNetworkImage
                  network={network(bridge.originationChainId)}
                  provider={bridge.bridge?.provider} />
                <ExplorerLink
                  chainId={originationChainId}
                  path={`${originationChainId === Chains.V4PLS ? '/#' : ''}/tx/${bridge.transaction?.hash || ''}`} />
              </div>
            </span>
            <span class="flex flex-row w-28 items-center">
              <div class="flex flex-row gap-2 items-center text-left">
                {#if asset}
                  <AssetWithNetwork {asset} tokenSize={8} networkSize={4} />
                  {:else}
                  <span class="size-8"></span>
                {/if}
                <span>{status}</span>
              </div>
            </span>
            <span class="flex flex-row w-36">
              <div class="flex flex-row items-center gap-2">
                <StaticNetworkImage
                  network={network(bridge.destinationChainId)}
                  provider={bridge.bridge?.provider} />

                {#if bridge.delivery?.transaction?.hash}
                  <ExplorerLink
                    chainId={toChain(bridge.destinationChainId)}
                    path={`${toChain(bridge.destinationChainId) === Chains.V4PLS ? '/#' : ''}/tx/${bridge.delivery?.transaction?.hash || ''}`} />
                {:else if status === 'Signed'}
                  {@const canDeliver = $fromChainId === toChain(bridge.destinationChainId)}
                  {#if !canDeliver}
                    <button
                      type="button"
                      title="Switch to destination chain"
                      class="px-4 py-0.5 text-white rounded leading-8 flex items-center justify-center shadow-md bg-purple-600 active:bg-purple-500 hover:bg-purple-500"
                      on:click={async () => {
                        await switchChain(toChain(bridge.destinationChainId))
                        const scrollTop = document.scrollingElement?.scrollTop
                        await goto(
                          `/delivery/${get(provider)}/${toChainKey(bridge.destinationChainId)}/${toChainKey(bridge.originationChainId)}/${zeroAddress}`,
                        )
                        if (scrollTop) scrollTo(0, scrollTop)
                      }}>Switch</button>
                  {:else}
                    {@const deliverBridgeTransaction = transactionButtonPress(() =>
                      deliverBridge(bridge),
                    )}
                    <button
                      type="button"
                      disabled={!canDeliver}
                      class="px-4 py-0.5 text-white rounded leading-8 flex items-center justify-center shadow-md bg-purple-600 active:bg-purple-500 hover:bg-purple-500"
                      on:click={deliverBridgeTransaction}>Deliver</button>
                  {/if}
                {/if}
              </div>
            </span>
            <button
              class="flex flex-row size-8 items-center justify-center"
              class:rotate-90={!!opened[bridge.orderId]}
              on:click={() => {
                showBridgeStepInfo(bridge, 0)
                opened = {
                  // ...opened, // allows others to be opened at the same time
                  [bridge.orderId]: !opened[bridge.orderId],
                }
              }}>
              <Icon icon="mdi:chevron-right" class="w-8 h-8" />
            </button>
          </div>
          <div
            class="transition-all duration-150 flex flex-col overflow-hidden w-full translate-y"
            class:h-0={!opened[bridge.orderId]}
            class:h-32={!!opened[bridge.orderId]}>
            <div class="flex flex-row w-full">
              <ol class="flex flex-row w-full justify-between mt-6 pb-6">
                <li class="h-0.5 flex flex-1" class:bg-green-500={step2Complete}>
                  <Hover let:handlers let:hovering>
                    {@const _info = hovering ? showBridgeStepInfo(bridge, 1) : ''}
                    <span
                      use:hover={handlers}
                      class="size-12 items-center justify-center flex rounded-full bg-green-500 border-green-500 text-white -mt-6">
                      <Icon icon="material-symbols:check" width="32" height="32" />
                    </span>
                  </Hover>
                </li>
                <li class="h-0.5 flex flex-1" class:bg-green-500={step3Complete}>
                  <Hover let:handlers let:hovering>
                    {@const _info = hovering ? showBridgeStepInfo(bridge, 2) : ''}
                    <span
                      use:hover={handlers}
                      class="size-12 items-center justify-center flex rounded-full border-green-500 text-white -mt-6"
                      class:bg-green-500={step2Complete}>
                      <Icon icon="material-symbols:check" width="32" height="32" />
                    </span>
                  </Hover>
                </li>
                <li class="h-0.5 flex flex-1" class:bg-green-500={step4Complete}>
                  <Hover let:handlers let:hovering>
                    {@const _info = hovering ? showBridgeStepInfo(bridge, 3) : ''}
                    <span
                      use:hover={handlers}
                      class="size-12 items-center justify-center flex rounded-full border-green-500 text-white -mt-6"
                      class:bg-green-500={step3Complete}>
                      <Icon icon="material-symbols:check" width="32" height="32" />
                    </span>
                  </Hover>
                </li>
                <li class="h-0.5 flex w-12">
                  <Hover let:handlers let:hovering>
                    {@const _info = hovering ? showBridgeStepInfo(bridge, 4) : ''}
                    <span
                      use:hover={handlers}
                      class="size-12 items-center justify-center flex rounded-full border-green-500 text-white -mt-6"
                      class:bg-green-500={step4Complete}>
                      <Icon icon="material-symbols:check" width="32" height="32" />
                      <Tooltip positionFlow="above" position="right" show={hovering}
                        >The transaction was delivered to the destination chain</Tooltip>
                    </span>
                  </Hover>
                </li>
              </ol>
            </div>
            <div class="flex flex-row w-full">
              {#each details as detail}
                <div class="flex flex-col w-1/3">
                  <div class="font-bold flex w-full">{detail.headline}</div>
                  <div class="font-mono flex w-full"
                    >{#if detail.type === 'duration'}
                      {detail.startTime?.toISOString().split('T')[1].split('.')[0]} -
                      {detail.endTime?.toISOString().split('T')[1].split('.')[0] || '?'}
                    {:else if detail.type === 'timestamp'}{detail.body}
                    {:else if detail.type === 'address'}{isAddress(detail.body)
                        ? ellipsis(detail.body, { length: dL, prefixLength: 2 })
                        : detail.body}{/if}</div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </Hover>
    {/each}
  </div>
</div>

<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { Chains, toChain, type VisualChain } from '$lib/stores/auth/types'
  import { finalizedBlocks } from '$lib/stores/chain-events'
  import type { Bridge } from '$lib/stores/history'
  import { ellipsis } from '$lib/stores/utils'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import ExplorerLink from './ExplorerLink.svelte'
  import Icon from '@iconify/svelte'
  import { deliverBridge } from '$lib/stores/delivery'
  import { useAuth } from '$lib/stores/auth/methods'
  import { flippedBridgeKey, fromChainId, toPath } from '$lib/stores/input'
  import { goto } from '$app/navigation'
  import { get } from 'svelte/store'
  import { networkSwitchAssetOutAddress } from '$lib/stores/bridge-settings'
  import { transactionButtonPress } from '$lib/stores/transaction'

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
    if (bridge.signatures!.items!.length === Number(bridge.requiredSignatures!.value)) {
      return 'Signed'
    }
    if (bridge.block?.number <= ($finalizedBlocks[chainId] || 0n)) {
      return 'Finalized'
    }
    return 'Pending'
  }
  // display / decimal / data length
  $: dL = 6
  let opened: Record<string, boolean> = {}

  const { switchChain } = useAuth()
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
      {@const status = getBridgeStatus(bridge)}
      {@const isDelivered = !!bridge.delivery?.transaction?.hash}
      {@const initiationSeconds = Number(bridge.transaction?.block?.timestamp)}
      {@const originationChainId = toChain(bridge.originationChainId)}
      <div class="flex flex-col">
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
          <span class="flex flex-row w-28 items-center justify-center">
            <div class="flex flex-row gap-2 px-4 justify-center items-center text-right">
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
                        `/delivery/${toPath(get(flippedBridgeKey))}/${get(networkSwitchAssetOutAddress)}`,
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
              opened = {
                // ...opened, // allows others to be opened at the same time
                [bridge.orderId]: !opened[bridge.orderId],
              }
            }}>
            <Icon icon="mdi:chevron-right" class="w-8 h-8" />
          </button>
        </div>
        <div
          class="transition-all duration-150 flex flex-row overflow-hidden w-full translate-y"
          class:h-0={!opened[bridge.orderId]}
          class:h-20={!!opened[bridge.orderId] && !isDelivered}
          class:h-32={!!opened[bridge.orderId] && isDelivered}>
          <div class="flex flex-col w-full translate-y-4">
            <div class="flex flex-row w-full">
              <div class="flex flex-col w-48">
                <div class="font-bold flex w-full">To</div>
                <div class="font-mono flex w-full">
                  {ellipsis(bridge.to || '', { length: dL, prefixLength: 2 })}
                </div>
              </div>
              <div class="flex flex-col w-48">
                <div
                  class="font-bold flex w-full"
                  title="Needed: {bridge.requiredSignatures?.value}">Started At</div>
                <div class="flex w-full">
                  {new Date(initiationSeconds * 1_000).toISOString().slice(0, -5)}Z
                </div>
              </div>
              {#if status === 'Signed' || status === 'Delivered'}
                <div class="flex flex-col w-48">
                  <div
                    class="font-bold flex w-full"
                    title="Signed: {bridge.signatures?.items.length}">Signed At</div>
                  <div class="flex w-full"
                    >{new Date(
                      bridge.signatures?.items[bridge.signatures?.items.length - 1].transaction
                        ?.block?.timestamp * 1_000,
                    )
                      .toISOString()
                      .slice(0, -5)}Z</div>
                </div>
              {:else}
                <div class="flex flex-col w-48"></div>
              {/if}
            </div>
            {#if isDelivered}
              {@const deliverySeconds = Number(bridge.delivery?.transaction?.block?.timestamp)}
              {@const sDelta = deliverySeconds - initiationSeconds}
              <div class="flex flex-row">
                <div class="flex flex-col w-48">
                  <div class="font-bold flex w-full">Delivered By</div>
                  <div class="font-mono flex w-full">
                    {ellipsis(bridge.delivery?.transaction?.from || '', {
                      length: dL,
                      prefixLength: 2,
                    })}
                  </div>
                </div>
                <div class="flex flex-col w-48">
                  <div
                    class="font-bold flex w-full"
                    title="Duration: {Math.floor(sDelta / 60)}m {sDelta % 60}s">Delivered At</div>
                  <div class="flex w-full">
                    {new Date(deliverySeconds * 1_000).toISOString().slice(0, -5)}Z
                  </div>
                </div>
                <div class="flex flex-col w-48">
                  <!--  -->
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

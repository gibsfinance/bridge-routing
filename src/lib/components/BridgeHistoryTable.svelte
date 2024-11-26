<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { Chains, toChain, type VisualChain } from '$lib/stores/auth/types'
  import { finalizedBlocks } from '$lib/stores/chain-events'
  import type { Bridge } from '$lib/stores/history'
  import { ellipsis } from '$lib/stores/utils'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import ExplorerLink from './ExplorerLink.svelte'
  import Icon from '@iconify/svelte'
  import type { UserRequestForSignature } from '$lib/gql/graphql'

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
    if (bridge.delivery?.transaction?.hash) return 'Delivered'
    if (bridge.signatures?.items?.length === bridge.requiredSignatures) return 'Signed'
    if (bridge.block?.number <= ($finalizedBlocks[chainId] || 0n)) return 'Finalized'
    return 'Pending'
  }
  // display / decimal / data length
  $: dL = 6
  let opened: Record<string, boolean> = {}
  const deliverBridge = (bridge: Bridge) => {
    // entry
    //       ? entry.safeExecuteSignaturesWithAutoGasLimit(
    //         signer.address,
    //         event.encodedData,
    //         signatures,
    //         overrides,
    //       )
    //       : foreignAmb.safeExecuteSignaturesWithAutoGasLimit(
    //         event.encodedData,
    //         signatures,
    //         overrides,
    //       )
    bridge.signatures?.items.map((sig) => {
      // console.log(sig)
    })
  }
</script>

<div
  class="max-w-4xl flex flex-col items-center justify-center bg-white rounded-lg px-4 py-4 shadow">
  <div class="flex flex-row">
    <div class="flex flex-row gap-4 font-bold leading-8">
      <span class="text-left w-48">From</span>
      <span class="text-left w-24">Origination</span>
      <span class="text-center w-28">Status</span>
      <span class="text-left w-40">Destination</span>
      <span class="text-right w-8"></span>
    </div>
  </div>
  <div class="flex flex-col items-center justify-center">
    {#each bridges as bridge}
      {@const status = getBridgeStatus(bridge)}
      {@const isDelivered = !!bridge.delivery?.transaction?.hash}
      {@const initiationSeconds = Number(bridge.transaction?.block?.timestamp)}
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
                chainId={toChain(bridge.originationChainId)}
                path={`${toChain(bridge.originationChainId) === Chains.V4PLS ? '/#' : ''}/tx/${bridge.transaction?.hash || ''}`} />
            </div>
          </span>
          <span class="flex flex-row w-28 items-center justify-center">
            <div class="flex flex-row gap-2 px-4 justify-center items-center text-right">
              <span>{status}</span>
            </div>
          </span>
          <span class="flex flex-row w-40">
            <div class="flex flex-row items-center gap-2">
              <StaticNetworkImage
                network={network(bridge.destinationChainId)}
                provider={bridge.bridge?.provider} />

              {#if bridge.delivery?.transaction?.hash}
                <ExplorerLink
                  chainId={toChain(bridge.destinationChainId)}
                  path={`${toChain(bridge.destinationChainId) === Chains.V4PLS ? '/#' : ''}/tx/${bridge.delivery?.transaction?.hash || ''}`} />
              {:else if status === 'Signed'}
                <button
                  type="button"
                  class="px-4 py-0.5 text-white rounded active:bg-purple-500 leading-8 flex items-center justify-center hover:bg-purple-500 bg-purple-600 shadow-md"
                  on:click={() => {
                    deliverBridge(bridge)
                  }}>Deliver</button>
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
                <div class="font-bold flex w-full" title="Needed: {bridge.requiredSignatures}"
                  >Started At</div>
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

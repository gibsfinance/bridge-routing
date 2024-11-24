<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { toChain, type VisualChain } from '$lib/stores/auth/types'
  import { finalizedBlocks } from '$lib/stores/chain-events'
  import type { Bridge } from '$lib/stores/history'
  import StaticNetworkImage from './StaticNetworkImage.svelte'

  export let bridges: Bridge[] = []
  const network = (chainId: string | number | undefined) =>
    chainsMetadata[toChain(chainId!)] as VisualChain
  const getBridgeStatus = (bridge: Bridge) => {
    const chainId = toChain(bridge!.bridge!.chainId)
    if (bridge.delivery?.transaction?.hash) return 'Delivered'
    if (bridge.signatures?.items?.length === bridge.requiredSignatures) return 'Signed'
    if (bridge.block?.number <= ($finalizedBlocks[chainId] || 0n)) return 'Finalized'
    return 'Pending'
  }
</script>

<table>
  <thead>
    <tr>
      <th>Chain</th>
      <th>Tx</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {#each bridges as bridge}
      <tr>
        <td>
          <StaticNetworkImage
            network={network(bridge.bridge?.chainId)}
            provider={bridge.bridge?.provider} />
        </td>
        <td>{bridge.transaction?.hash.slice(0, 8)}...{bridge.transaction?.hash.slice(-8)}</td>
        <td>{getBridgeStatus(bridge)}</td>
      </tr>
    {/each}
  </tbody>
</table>

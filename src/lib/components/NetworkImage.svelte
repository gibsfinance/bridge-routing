<script lang="ts">
  import { type VisualChain } from '$lib/stores/auth/types'
  import Icon from '@iconify/svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { bridgeKey, partnerBridgeKey, toPath } from '$lib/stores/input'
  import { assetOut } from '$lib/stores/bridge-settings'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import _ from 'lodash'
  import { validBridgeKeys } from '$lib/stores/config'
  import { zeroAddress } from 'viem'
  $: provider = $page.params.provider

  let dropdown!: HTMLDetailsElement
  export let network!: VisualChain
  export let size: number | undefined = undefined
  export let inChain = false
  $: bridgeKeyIndex = (2 - Number(inChain)) as 2 | 1
  $: networkOptions = inChain
    ? $validBridgeKeys
    : $validBridgeKeys.filter((vbk) => vbk[0] === $bridgeKey[0] && vbk[1] === $bridgeKey[1])
  $: reorderedBridgeKeys = [$partnerBridgeKey].concat(
    networkOptions
      .slice(0)
      .filter((vbk) => !_.isEqual(vbk, $bridgeKey) && !_.isEqual(vbk, $partnerBridgeKey))
      .concat([$bridgeKey]),
  )
</script>

{#if inChain}
  <details class="dropdown relative flex flex-grow justify-center" bind:this={dropdown}>
    <summary class="flex flex-row justify-items-center items-center space-x-2 select-none">
      <StaticNetworkImage {network} {size} {provider} />
      <span class="leading-8 ml-1">{network.name}</span>
      <Icon icon="mingcute:down-fill" class="flex size-5" />
    </summary>
    <ul
      class="dropdown-content absolute z-[1] px-0 pt-0 shadow bg-slate-50 pb-1 -mt-1 -mx-2 top-0 left-0 w-60">
      {#each reorderedBridgeKeys as o}
        <li class="hover:bg-slate-200 items-center flex flex-row">
          <button
            class="px-2 flex flex-row h-10 flex-grow items-center"
            on:click={async () => {
              dropdown.open = false
              const tokenAddressIn =
                o === $partnerBridgeKey ? $assetOut?.address : zeroAddress || zeroAddress
              await goto(`/delivery/${toPath(o)}/${tokenAddressIn}`)
              return
            }}>
            <StaticNetworkImage
              network={chainsMetadata[o[bridgeKeyIndex]]}
              provider={o[0]}
              {size} />
            <span class="px-2 flex flex-grow">{chainsMetadata[o[bridgeKeyIndex]].name}</span>
          </button>
        </li>
      {/each}
    </ul>
  </details>
{:else}
  <div class="flex flex-row justify-items-center items-center space-x-2">
    <StaticNetworkImage {network} {size} />
    <span class="leading-8">{network.name}</span>
  </div>
{/if}

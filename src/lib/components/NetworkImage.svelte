<script lang="ts">
  import { Chains, type DestinationChains, type VisualChain } from '$lib/stores/auth/types'
  import Icon from '@iconify/svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  // import { desiredAssetIn } from '$lib/stores/bridge-settings'
  import { bridgeKey, assetIn } from '$lib/stores/input'
  import { destinationChains } from '$lib/stores/config'
  import { goto } from '$app/navigation'

  let dropdown!: HTMLDetailsElement
  export let network!: VisualChain
  export let height: number | undefined = undefined
  export let networkOptions: Chains[] = []
  $: reorderedBridgeKeys = networkOptions.slice(0).sort((a, b) => {
    if (b === $bridgeKey) {
      return -1
    }
    if (a === $bridgeKey) {
      return 1
    }
    return a > b ? 1 : -1
  })
  const providerFromOption = (option: Chains) => destinationChains[option as DestinationChains].provider
</script>

{#if reorderedBridgeKeys.length}
  <details class="dropdown static flex flex-grow justify-center" bind:this={dropdown}>
    <summary class="flex flex-row justify-items-center items-center space-x-2 select-none">
      <StaticNetworkImage {network} {height} provider={destinationChains[$bridgeKey].provider} />
      <span class="leading-8 ml-1">{network.name}</span>
      <Icon icon="mingcute:down-fill" height="1.25em" width="1.25em" class="flex" />
    </summary>
    <ul class="dropdown-content absolute z-[1] p-0 shadow bg-slate-50 w-fit py-1 -mt-10 -mx-2">
      {#each reorderedBridgeKeys as option}
        <li class="hover:bg-slate-200 h-10 items-center flex flex-row">
          <button
            class="px-2 flex flex-row flex-grow items-center"
            on:click={async () => {
              for (const [key, val] of Object.entries(Chains)) {
                if (val === option) {
                  await goto(key, { noScroll: true })
                  assetIn.set(null)
                  dropdown.open = false
                  return
                }
              }
            }}>
            <StaticNetworkImage network={chainsMetadata[option]} provider={providerFromOption(option)} {height} />
            <span class="px-2 flex flex-grow">{chainsMetadata[option].name}</span>
          </button>
        </li>
      {/each}
    </ul>
  </details>
{:else}
  <div class="flex flex-row justify-items-center items-center space-x-2">
    <StaticNetworkImage {network} {height} />
    <span class="leading-8">{network.name}</span>
  </div>
{/if}

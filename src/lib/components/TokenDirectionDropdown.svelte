<!-- <script lang="ts">
  import { goto } from '$app/navigation'
  import TokenDirection from '$lib/components/TokenDirection.svelte'
  import { assets, bridgeKey, bridgeKeys } from '$lib/stores/bridge-settings'
  import Icon from '@iconify/svelte'
  let dropdown!: HTMLDetailsElement
  $: reorderedBridgeKeys = bridgeKeys.slice(0).sort((a, b) => {
    if (a === $bridgeKey) {
      return 1
    }
    return a > b ? 1 : -1
  })
</script>

<details class="dropdown flex flex-grow justify-center mt-8 mx-auto" bind:this={dropdown}>
  <summary class="flex flex-row justify-items-center items-center space-x-2 ml-7 select-none">
    <TokenDirection
      provider={assets[$bridgeKey].provider}
      fromAsset={assets[$bridgeKey].input}
      toAsset={assets[$bridgeKey].output} />
    <Icon icon="mingcute:down-fill" height="1.25em" width="1.25em" class="flex" />
  </summary>
  <ul class="dropdown-content z-[1] p-0 -mt-12 ml-5 shadow bg-slate-50 w-fit" tabindex="-1">
    {#each reorderedBridgeKeys as key}
      <li class="hover:bg-slate-200 h-14 items-center flex justify-around">
        <button
          class="px-2"
          on:click={async () => {
            await goto(key, {
              noScroll: true,
            })
            dropdown.open = false
          }}>
          <TokenDirection provider={assets[key].provider} fromAsset={assets[key].input} toAsset={assets[key].output} />
        </button>
      </li>
    {/each}
  </ul>
</details> -->

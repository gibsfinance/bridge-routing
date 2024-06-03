<script lang="ts">
  import Icon from '@iconify/svelte'
  import { onMount } from 'svelte'
  const openModal = () => {
    const el = document.querySelector('#bridge-info-modal') as any
    el.showModal()
  }
  const bridgeUrl = 'https://bridge.pulsechain.com/'
  let directUrl = ''
  const getDirectUrl = () => {
    fetch(`${bridgeUrl}version.json`)
      .then((res) => res.json())
      .then((j) => {
        directUrl = j.ipfs_gateways[0]
      })
  }
  onMount(() => {
    getDirectUrl()
  })
</script>

<div class="flex flex-row">
  <button
    type="button"
    class="border-2 rounded-full h-8 w-8 mr-2 flex justify-center items-center"
    on:click={openModal}>
    <Icon icon="entypo:info" />
  </button>

  <a href="https://github.com/gibsfinance" target="_blank" class="mr-2">
    <button class="border-2 rounded-full h-8 w-8 flex justify-center items-center">
      <Icon icon="fe:github-alt" height="1.5em" width="1.5em" />
    </button>
  </a>
  <a href="https://etherscan.io/address/0x5f542C3ce02a56586a91A7DE80deBF29947836eD#code" target="_blank" class="mr-2">
    <button class="border-2 rounded-full h-8 w-8 flex justify-center items-center">
      <Icon icon="mdi:ethereum" height="1.5em" width="1.5em" />
    </button>
  </a>
  <a href="https://x.com/gibsfinance" target="_blank" class="mr-2">
    <button class="border-2 rounded-full h-8 w-8 flex justify-center items-center">
      <Icon icon="ri:twitter-fill" height="1.25em" width="1.25em" />
    </button>
  </a>
</div>
<dialog id="bridge-info-modal" class="modal">
  <div class="modal-box text-slate-50">
    <h3 class="font-bold text-center items-center flex justify-center text-lg mb-2">
      <Icon icon="material-symbols:info-outline" height="3em" width="3em" />
    </h3>
    <div class="flex">
      <ul class="gap-4 flex flex-col">
        <li class="flex">
          This UI uses the bridge contracts directly, so all of the same security assumptions are present.
        </li>
        <li>The only difference is that the final router contract on Ethereum has been swapped out.</li>
        <li>
          This modified implementation allows the runner's actions to be measured and creates an economic incentive to
          deliver native tokens, maintaining privacy for the end user (you).
        </li>
        <li>
          If, for any reason, your transaction is not run in a timely manner, you can always use <span class="inline">
            <a class="underline" target="_blank" href="https://bridge.pulsechain.com">bridge.pulsechain.com</a>
            <a href={directUrl} target="_blank">
              <Icon icon="gis:direct" class="inline ml-2 mr-1" height="2em" width="2em" />
            </a>
          </span>
          to complete the bridge yourself and pay zero fees outside of the bridge fees.
        </li>
      </ul>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

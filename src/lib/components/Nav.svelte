<script lang="ts">
  import { goto } from '$app/navigation'
  import gibs from '$lib/images/1FAF0.svg'
  import { onMount } from 'svelte'
  import Icon from '@iconify/svelte'
  import Loading from './Loading.svelte'
  import { page } from '$app/stores'

  let bridgeUrl = ''

  onMount(() => {
    fetch('https://bridge.pulsechain.com/version.json')
      .then((res) => res.json())
      .then((res) => {
        bridgeUrl = res.ipfs_gateways[0]
      })
  })

  const gotoHome = async () => {
    await goto('/')
  }
  const gotoNativeDelivery = async () => {
    await goto('/delivery')
  }
  const gotoTransactions = async () => {
    window.location.href = `${bridgeUrl}/#/transactions`
  }
</script>

<div class="h-10 -mb-10 z-40 flex">
  <nav class="fixed h-10 leading-8 px-2 flex flex-row right-0 left-0 shadow-inner bg-slate-950">
    <div class="max-w-5xl m-auto w-full flex justify-between">
      <span
        role="button"
        tabindex="-1"
        on:keypress={gotoHome}
        on:click={gotoHome}
        class="link leading-8 pr-2 text-white font-italiana uppercase flex flex-row">
        <img src={gibs} alt="a yellow hand with index finger and thub rubbing together" class="size-8" />
        <span class="leading-8">Gibs&nbsp;</span>
        <Loading />
      </span>
      <div class="items-center flex">
        <ul class="flex flex-row items-center">
          <li>
            <button class="h-10 w-10 text-white flex items-center justify-center" on:click={gotoTransactions}>
              <Icon icon="bitcoin-icons:transactions-filled" height="1.6em" width="1.6em" />
            </button>
          </li>
          {#if !$page.route.id?.includes('/delivery')}
            <li>
              <button class="link" on:keypress={gotoNativeDelivery} on:click={gotoNativeDelivery}>🌁</button>
            </li>
          {/if}
        </ul>
        <div id="onboard-container"></div>
      </div>
    </div>
  </nav>
</div>

<style lang="postcss">
  .link {
    @apply cursor-pointer px-2 py-1 text-xl;
  }
</style>

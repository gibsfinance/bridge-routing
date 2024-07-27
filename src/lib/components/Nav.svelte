<script lang="ts">
  import { type as modalType } from '$lib/stores/modal'
  import VersionedLink from '$lib/components/VersionedLink.svelte'
  import { goto } from '$app/navigation'
  import gibs from '$lib/images/1FAF0.svg'
  import { onMount } from 'svelte'
  import Icon from '@iconify/svelte'
  import Loading from './Loading.svelte'
  import { page } from '$app/stores'
  import { bridgeKey } from '$lib/stores/input'
  import { Chains } from '$lib/stores/auth/types'
  import { domains, windowStore } from '$lib/stores/window'

  onMount(() => {
    domains.add('bridge.pulsechain.com')
  })

  const gotoHome = async () => {
    await goto('/')
  }
  const gotoNativeDelivery = async () => {
    await goto('/delivery')
  }
  const showRPCConfig = () => {
    modalType.set('rpc')
  }
  $: txnText = $windowStore.innerWidth < 512 ? 'Txns' : 'Transactions'
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
        <span class="leading-8 text-2xl">Gibs&nbsp;</span>
        <Loading />
      </span>
      <div class="items-center flex grow content-end">
        <ul class="flex flex-row items-center grow text-white justify-end">
          <li class="flex flex-row">
            {#if $bridgeKey === Chains.ETH}
              <VersionedLink domain="bridge.pulsechain.com" path="/#/transactions" let:direct let:path>
                <a
                  aria-label="to recent bridge transactions on ethereum"
                  href="{direct}{path}"
                  target="_blank"
                  class="link">
                  <button type="button" name="transactions" class="text-white flex items-center justify-center">
                    {txnText}&nbsp;<Icon icon="ic:baseline-list" height="1.6em" width="1.6em" />
                  </button>
                </a>
              </VersionedLink>
            {:else}
              <a
                aria-label="to recent bridge transactions on bsc"
                href="https://tokensex.link/explorer"
                target="_blank"
                class="link">
                <button type="button" name="transactions" class="text-white flex items-center justify-center">
                  {txnText}&nbsp;<Icon icon="ic:baseline-list" height="1.6em" width="1.6em" />
                </button>
              </a>
            {/if}
          </li>
          <li class="flex flex-row pl-2">
            <button type="button" name="rpc-settings" class="link" on:click={showRPCConfig}>
              RPC&nbsp;<Icon icon="gravity-ui:plug-connection" height="1.2em" width="1.2em" />
            </button>
          </li>
          {#if !$page.route.id?.includes('/delivery')}
            <li class="flex flex-row items-center pl-2">
              <button
                type="button"
                name="bridge"
                class="link"
                on:keypress={gotoNativeDelivery}
                on:click={gotoNativeDelivery}
                >Delivery&nbsp;<Icon icon="icon-park-outline:bridge-one" height="1.6em" width="1.6em" /></button>
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
    @apply cursor-pointer px-2 py-1 flex flex-row items-center text-white;
  }
</style>

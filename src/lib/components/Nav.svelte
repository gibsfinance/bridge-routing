<script lang="ts">
  import VersionedLink from '$lib/components/VersionedLink.svelte'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import Icon from '@iconify/svelte'
  import Loading from './Loading.svelte'
  import { page } from '$app/state'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import { addDomain } from '$lib/stores/window.svelte'
  import { innerWidth } from 'svelte/reactivity/window'
  import Image from './Image.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import * as rpcs from '$lib/stores/rpcs.svelte'
  import RPC from './RPC.svelte'
  import Button from './Button.svelte'
  import ConnectButton from './ConnectButton.svelte'
  const gibs = new URL('/images/1FAF0.svg', import.meta.url).href

  onMount(() => {
    addDomain('bridge.pulsechain.com')
  })

  const gotoHome = async () => {
    await goto('#/')
  }
  const gotoNativeDelivery = async () => {
    await goto('#/delivery')
  }
  const gotoOnboard = async () => {
    await goto('#/onboard')
  }
  const txnText = $derived(innerWidth.current && innerWidth.current < 512 ? 'Txns' : 'Transactions')
  const destinationBridgeKey = $derived(bridgeKey.toChain)
  const isDeliveryRoute = $derived(page.route.id?.includes('/delivery'))
  const isOnboardRoute = $derived(page.route.id?.includes('/onboard'))
  // const alwaysSmall = true
  const isSmall = $derived(innerWidth.current && innerWidth.current < 768)
</script>

<div class="fixed z-40 -mb-10 flex h-10">
  <nav
    class="fixed right-0 left-0 flex h-14 flex-row bg-surface-950-50 p-2 leading-8 shadow-inner text-surface-contrast-50">
    <div class="m-auto flex w-full max-w-5xl justify-between">
      <button
        type="button"
        onkeypress={gotoHome}
        onclick={gotoHome}
        class="link font-italiana flex flex-row pr-2 leading-8 uppercase">
        <Image
          src={gibs}
          alt="a yellow hand with index finger and thub rubbing together"
          sizeClasses="size-8" />
        <span class="text-2xl leading-8">Gibs&nbsp;</span>
        <Loading />
      </button>
      <div class="flex grow content-end items-center">
        <ul
          class="flex grow flex-row items-center justify-end text-surface-contrast-50"
          class:gap-2={!isSmall}>
          <li class="flex flex-row">
            {#if destinationBridgeKey === Chains.ETH}
              <VersionedLink
                domain="bridge.pulsechain.com"
                path="/#/transactions"
                let:direct
                let:path>
                <a
                  aria-label="to recent bridge transactions on ethereum"
                  href="{direct}{path}"
                  target="_blank"
                  class="link">
                  <button
                    type="button"
                    name="transactions"
                    class="flex items-center justify-center">
                    <!-- {#if !isSmall}{txnText}&nbsp;{/if} -->
                    <Icon icon="ic:baseline-list" height="1.6em" width="1.6em" />
                  </button>
                </a>
              </VersionedLink>
            {:else}
              <a
                aria-label="to recent bridge transactions on bsc"
                href="https://tokensex.link/explorer"
                target="_blank"
                class="link">
                <button type="button" name="transactions" class="flex items-center justify-center">
                  <!-- {#if !isSmall}{txnText}&nbsp;{/if} -->
                  <Icon icon="ic:baseline-list" height="1.6em" width="1.6em" />
                </button>
              </a>
            {/if}
          </li>
          <li class="flex flex-row">
            <ModalWrapper triggerClasses="flex flex-row items-center px-2 py-1">
              {#snippet button()}
                <!-- {#if !isSmall}RPC&nbsp;{/if} -->
                <Icon icon="gravity-ui:plug-connection" height="1.2em" width="1.2em" />
              {/snippet}
              {#snippet contents({ close })}
                <RPC
                  data={rpcs.store.entries()}
                  onclose={close}
                  onsubmit={(updates) => {
                    updates.forEach(([chain, list]) => {
                      rpcs.store.set(chain, list)
                    })
                  }} />
              {/snippet}
            </ModalWrapper>
          </li>
          {#if !isDeliveryRoute}
            <li class="flex flex-row items-center">
              <button
                type="button"
                name="bridge"
                class="link"
                onkeypress={gotoNativeDelivery}
                onclick={gotoNativeDelivery}>
                <!-- {#if !isSmall}Delivery&nbsp;{/if} -->
                <Icon icon="icon-park-solid:bridge-one" height="1.6em" width="1.6em" /></button>
            </li>
          {/if}
          {#if !isOnboardRoute}
            <li class="flex flex-row items-center">
              <Button class="flex flex-row items-center px-2 py-1" onclick={gotoOnboard}>
                <!-- {#if !isSmall}Onboard&nbsp;{/if} -->
                <Icon icon="mingcute:run-fill" stroke-width="1.5" height="1.6em" width="1.6em" />
              </Button>
            </li>
          {/if}
          <li class="flex flex-row items-center">
            <ConnectButton />
          </li>
        </ul>
      </div>
    </div>
  </nav>
</div>

<style lang="postcss">
  @reference "tailwindcss/theme";
  .link {
    @apply flex cursor-pointer flex-row items-center px-2 py-1;
  }
</style>

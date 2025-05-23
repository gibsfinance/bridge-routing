<script lang="ts">
  import { onMount } from 'svelte'
  import Icon from '@iconify/svelte'
  import Loading from './Loading.svelte'
  import { page, goto } from '../stores/page.svelte'
  import { bridgeKey, incrementForcedRefresh } from '../stores/input.svelte'
  import { Provider } from '../stores/auth/types'
  import { addDomain } from '../stores/window.svelte'
  import { innerWidth } from 'svelte/reactivity/window'
  import Image from './Image.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import * as rpcs from '../stores/rpcs.svelte'
  import RPC from './RPC.svelte'
  import Button from './Button.svelte'
  import ConnectButton from './ConnectButton.svelte'
  // import in order to link appropriately
  const gibs = 'images/1FAF0.svg'

  const bridgeDomain = 'bridge.pulsechain.com'
  onMount(() => {
    addDomain(bridgeDomain)
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
  const destinationBridgeKey = $derived(bridgeKey.provider)
  const isDeliveryRoute = $derived(page.route.id?.includes('/delivery'))
  const isOnboardRoute = $derived(page.route.id?.includes('/onboard'))
  const isSmall = $derived(innerWidth.current && innerWidth.current < 768)
  const txsLink = $derived(
    destinationBridgeKey === Provider.PULSECHAIN
      ? 'https://ipfs.bridge.pulsechain.com/transactions'
      : 'https://tokensex.link/explorer'
  )
</script>

<div class="sticky z-20 w-full -mb-14 flex h-14">
  <nav
    class="grow flex h-14 flex-row bg-white p-2 leading-8 shadow text-surface-contrast-50">
    <div class="m-auto flex w-full max-w-5xl justify-between">
      <button
        type="button"
        onkeypress={gotoHome}
        onclick={gotoHome}
        class="cursor-pointer items-center font-italiana flex flex-row pr-2 pl-0 leading-8">
        <Image
          src={gibs}
          alt="a yellow hand with index finger and thub rubbing together"
          sizeClasses="size-8" />
        <span class="text-2xl leading-8 font-bold">Gibs&nbsp;</span>
        <Loading />
      </button>
      <div class="flex grow content-end items-center">
        <ul class="flex grow flex-row items-center justify-end text-surface-contrast-50">
          {#if isDeliveryRoute}
            <li class="flex flex-row">
              <a
                aria-label="to recent bridge transactions on ethereum"
                href={txsLink}
                target="_blank"
                class="link">
                <button
                  type="button"
                  name="transactions"
                  class="flex items-center justify-center">
                  {#if !isSmall}Txs{/if}
                  <Icon icon="ic:baseline-list" height="1.6em" width="1.6em" />
                </button>
              </a>
            </li>
          {/if}
          <li class="flex flex-row">
            <ModalWrapper
              triggerClasses="flex flex-row items-center px-2 py-1 gap-1"
              contentHeightClass="max-h-[460px] h-full">
              {#snippet button()}
                {#if !isSmall}RPC{/if}
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
                    incrementForcedRefresh()
                    close()
                  }} />
              {/snippet}
            </ModalWrapper>
          </li>
          {#if !isDeliveryRoute}
            <li class="flex flex-row items-center">
              <button
                type="button"
                name="bridge"
                class="link gap-1"
                onkeypress={gotoNativeDelivery}
                onclick={gotoNativeDelivery}>
                {#if !isSmall}Delivery{/if}
                <Icon icon="hugeicons:bridge" height="1.6em" width="1.6em" /></button>
            </li>
          {/if}
          {#if !isOnboardRoute}
            <li class="flex flex-row items-center">
              <Button class="flex flex-row items-center px-2 py-1 gap-1" onclick={gotoOnboard}>
                {#if !isSmall}Onboard{/if}
                <Icon icon="mingcute:run-fill" stroke-width="1.5" height="1.6em" width="1.6em" />
              </Button>
            </li>
          {/if}
          {#if isOnboardRoute || isDeliveryRoute}
            <li class="flex flex-row items-center">
              <ConnectButton />
            </li>
          {/if}
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

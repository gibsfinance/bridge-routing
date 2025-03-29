<script lang="ts">
  import Button from '$lib/components/Button.svelte'
  import ModalWrapper from '$lib/components/ModalWrapper.svelte'
  import { accountState, modal } from '$lib/stores/auth/AuthProvider.svelte'
  import LifiWidget from './bridges/LifiWidget.svelte'
  import lifiLogo from '$lib/images/providers/lifi.svg?raw'
  import Section from './Section.svelte'
  import Icon from '@iconify/svelte'
  import Image from './Image.svelte'

  let onrampsOpen = $state(false)
  const toggleOnramps = () => {
    onrampsOpen = !onrampsOpen
  }
  const openOnRamp = () => {
    modal.open({
      view: 'OnRampProviders',
    })
  }
  let lifiOpen = $state(false)
</script>

<Section id="onramp-section" focused>
  <div class="flex flex-col w-full justify-start">
    <div class="flex flex-row gap-2 items-center">
      <span class="text-gray-500 text-sm w-full text-left">Onramps</span>
      <Button
        class="flex flex-row gap-2 items-center text-surface-contrast-50 justify-between"
        onclick={toggleOnramps}
        id="onramp-section">
        <Icon
          icon="mdi:bank"
          mode="svg"
          class="size-7 p-1 text-white [&>path]:text-black flex transition-all duration-100 {onrampsOpen
            ? 'rotate-180'
            : ''}" />
      </Button>
    </div>
    <ul
      class="flex flex-row gap-2 items-center overflow-hidden transition-all duration-200"
      class:h-0={!onrampsOpen}
      class:h-8={onrampsOpen}
      class:mt-2={onrampsOpen}>
      <li class="hover:bg-surface-900-100 border rounded-2xl overflow-hidden h-8">
        <a
          href="https://zkp2p.xyz/swap?toToken=ETH{accountState.address
            ? `&recipientAddress=${accountState.address}`
            : ''}"
          target="_blank"
          class="flex flex-row gap-1 items-center text-surface-contrast-50 px-3 justify-between w-full h-8">
          <span class="h-full leading-8 text-base">ZKP2P</span>
          <span class="size-8 items-center flex justify-center">
            <Image src="https://zkp2p.xyz/logo512.png" sizeClasses="size-6" />
          </span>
        </a>
      </li>
      <li class="hover:bg-surface-900-100 border rounded-2xl overflow-hidden h-8">
        <Button
          onclick={() => (lifiOpen = !lifiOpen)}
          class="flex flex-row gap-2 items-center text-surface-contrast-50 px-3 justify-between w-full [&>svg]:w-12">
          {@html lifiLogo}
        </Button>
        <!-- <ModalWrapper
          contentWidthClass="w-full max-w-[440px]"
          triggerClasses="flex flex-row gap-2 items-center text-surface-contrast-50 px-3 justify-between w-full [&>svg]:w-12"
          contentBorderClass="">
          {#snippet button()}
            {@html lifiLogo}
          {/snippet}
          {#snippet contents()}{/snippet}
        </ModalWrapper> -->
        {#if lifiOpen}
          <LifiWidget close={() => (lifiOpen = false)} />
          <!-- <Icon icon="mdi:bank" mode="svg" class="size-7 p-1 text-white [&>path]:text-black flex" /> -->
        {/if}
      </li>
      <li
        class="hover:bg-surface-900-100 border rounded-2xl overflow-hidden h-8 ml-auto text-base text-gray-500">
        <Button onclick={openOnRamp} class="px-2 leading-8">Others</Button>
      </li>
    </ul>
  </div>
</Section>

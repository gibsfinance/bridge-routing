<script lang="ts">
  import Icon from '@iconify/svelte'

  import lifiLogo from '../../images/providers/lifi.svg?raw'
  import coinbaseLogo from '../../images/providers/coinbase.svg?raw'

  import { accountState, modal } from '../stores/auth/AuthProvider.svelte'
  import { onboardShowOnramps } from '../stores/storage.svelte'

  import Button from './Button.svelte'
  import LifiWidget from './bridges/LifiWidget.svelte'
  import Section from './Section.svelte'
  import Image from './Image.svelte'

  const toggleOnramps = () => {
    onboardShowOnramps.value = !onboardShowOnramps.value
  }
  const onrampsOpen = $derived.by(() => onboardShowOnramps.value)
  const openOnRamp = () => {
    modal.open({
      view: 'OnRampProviders',
    })
  }
  const openCoinbase = () => {
    const url = new URL('https://pay.coinbase.com/buy/select-asset')
    url.searchParams.set('appId', 'bf18c88d-495a-463b-b249-0b9d3656cf5e')
    url.searchParams.set(
      'addresses',
      JSON.stringify({
        [accountState.address!]: ['ethereum'],
      }),
    )
    url.searchParams.set('assets', JSON.stringify(['ETH', 'WBTC', 'USDC', 'USDT', 'DAI']))
    url.searchParams.set('defaultNetwork', 'ethereum')
    url.searchParams.set('defaultExperience', 'buy')
    window.open(url, 'coinbase-onramp', 'width=400,height=600')
  }
  let lifiOpen = $state(false)
</script>

<Section id="onramp-section" focused>
  <div class="flex flex-col w-full justify-start">
    <div class="flex flex-row gap-2 items-center">
      <span class="text-gray-500 text-sm w-full text-left">Onramps to Ethereum</span>
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
      <li class="hover:bg-surface-50 border rounded-2xl overflow-hidden h-8 flex">
        <Button
          onclick={accountState.address ? openCoinbase : () => modal.open({ view: 'Connect' })}
          class="flex flex-row items-center text-surface-contrast-50 pl-3 justify-between w-full">
          <span class="h-full flex leading-8 text-base">Coinbase</span>
          <span
            class="size-8 items-center flex justify-center overflow-hidden rounded-full scale-90 [&>svg]:w-8 translate-x-[1px]">
            <!-- <Image src="https://zkp2p.xyz/logo512.png" sizeClasses="size-6" /> -->
            {@html coinbaseLogo}
          </span>
        </Button>
      </li>
      <li class="hover:bg-surface-50 border rounded-2xl overflow-hidden h-8 flex">
        <a
          href="https://zkp2p.xyz/swap?toToken=ETH{accountState.address
            ? `&recipientAddress=${accountState.address}`
            : ''}"
          target="_blank"
          class="flex flex-row gap-1 items-center text-surface-contrast-50 pl-3 justify-between w-full h-8">
          <span class="h-full leading-8 text-base">ZKP2P</span>
          <span class="size-8 items-center flex justify-center">
            <Image src="https://zkp2p.xyz/logo512.png" sizeClasses="size-6" />
          </span>
        </a>
      </li>
      <li class="hover:bg-surface-50 border rounded-2xl overflow-hidden h-8 flex">
        <Button
          onclick={() => (lifiOpen = !lifiOpen)}
          class="flex flex-row gap-2 items-center text-surface-contrast-50 px-3 justify-between w-full [&>svg]:w-12">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html lifiLogo}
        </Button>
        {#if lifiOpen}
          <LifiWidget close={() => (lifiOpen = false)} />
        {/if}
      </li>
      <li
        class="hover:bg-surface-50 border rounded-2xl overflow-hidden h-8 ml-auto text-base text-gray-500">
        <Button onclick={openOnRamp} class="px-2 leading-8">Others</Button>
      </li>
    </ul>
  </div>
</Section>

<script lang="ts">
  import BlurryImage from './BlurryImage.svelte'
  import { onMount } from 'svelte'
  import { innerWidth, innerHeight } from 'svelte/reactivity/window'
  import Icon from '@iconify/svelte'
  import Button from './Button.svelte'
  import * as nav from '../stores/nav.svelte'
  import { defaultBridgeKey, bridgeKey, bridgableTokens } from '../stores/input.svelte'
  import { loadAssetLink } from '../stores/chain-events.svelte'
  import { searchKnownAddresses } from '../stores/bridge-settings.svelte'
  import { Chains, Providers, nativeAssetOut, toChain } from '@gibs/bridge-sdk/config'
  import { zeroAddress, type Hex } from 'viem'

  const payMe = 'images/pay-me.png'
  let toggle = $state(false)
  let showArrow = $state(true)
  onMount(() => {
    const id = setTimeout(() => {
      toggle = true
    }, 200)

    const handleScroll = () => {
      showArrow = window.scrollY < 80
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      clearTimeout(id)
      window.removeEventListener('scroll', handleScroll)
    }
  })
  const isSmall = $derived(innerWidth.current && innerWidth.current < 768)
  const isSmallHeight = $derived(innerHeight.current && innerHeight.current < 740)

  const handleGetStarted = () => {
    nav.bridge.shallow(defaultBridgeKey)
  }

  const handleImageLoad = (e: Event) => {
    (e.target as HTMLElement).classList.remove('animate-pulse')
  }

  const handleTokenClick = (tokenAddress: string) => {
    nav.onboard.shallow({ bridgeTokenIn: tokenAddress })
  }
</script>

<BlurryImage height={isSmallHeight ? '600px' : "calc(100vh - 180px)"} image_url="url({payMe})">
  <div class="flex flex-col items-center justify-center h-fit gap-8 top-0 bottom-0 left-0 right-0 m-auto max-w-5xl px-4 relative text-white dark:text-slate-950">
    <h1
      class="font-italiana z-10 text-center text-7xl md:text-8xl content-center flex grow justify-center justify-items-center h-24 transition-all duration-300 font-bold"
      class:translate-y-8={!toggle}>
      Gibs Bridge
    </h1>

    <div class="text-center max-w-3xl transition-all duration-200 delay-100 space-y-6"
      class:opacity-0={!toggle}>

      <!-- Main value prop -->
      <h2 class="text-2xl md:text-3xl font-semibold">
        Move Your Tokens Between Chains
      </h2>

      <!-- Supported routes -->
      <div class="flex flex-col md:flex-row items-center justify-center gap-4 text-lg">
        <div class="flex items-center gap-2">
          <Icon icon="cryptocurrency:eth" class="text-2xl" />
          <span>Ethereum</span>
        </div>
        <Icon icon="mdi:swap-horizontal" class="text-2xl" />
        <div class="flex items-center gap-2">
          <img src="https://gib.show/image/369" alt="PulseChain" class="w-6 h-6 rounded-full brightness-0 invert dark:brightness-100 dark:invert-0" />
          <span>PulseChain</span>
        </div>
        <Icon icon="mdi:swap-horizontal" class="text-2xl" />
        <div class="flex items-center gap-2">
          <Icon icon="cryptocurrency:bnb" class="text-2xl" />
          <span>BSC</span>
        </div>
      </div>

      <!-- Key benefits -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div class="bg-white/10 dark:bg-surface-950/40 rounded-lg p-4 backdrop-blur-sm">
          <Icon icon="mdi:lightning-bolt" class="text-3xl mx-auto mb-2" />
          <div class="font-semibold">~30 Minutes</div>
          <div class="text-sm opacity-90">Average bridging time</div>
        </div>
        <div class="bg-white/10 dark:bg-surface-950/40 rounded-lg p-4 backdrop-blur-sm">
          <Icon icon="mdi:shield-check" class="text-3xl mx-auto mb-2" />
          <div class="font-semibold">Secure</div>
          <div class="text-sm opacity-90">Cryptographically secured</div>
        </div>
        <div class="bg-white/10 dark:bg-surface-950/40 rounded-lg p-4 backdrop-blur-sm">
          <Icon icon="mdi:cash-multiple" class="text-3xl mx-auto mb-2" />
          <div class="font-semibold">Low Fees</div>
          <div class="text-sm opacity-90">Down to 0.05%</div>
        </div>
      </div>

      <!-- Popular tokens -->
      <div class="flex items-center justify-center gap-3">
        <span class="text-sm opacity-90">Popular tokens:</span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={() => handleTokenClick('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')}
            class="transition-transform hover:scale-110"
            aria-label="Bridge USDC">
            <img
              src="https://gib.show/image/1/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              alt="USDC"
              class="w-6 h-6 rounded-full bg-white/10 animate-pulse"
              onload={handleImageLoad}
            />
          </button>
          <button
            type="button"
            onclick={() => handleTokenClick('0xdac17f958d2ee523a2206206994597c13d831ec7')}
            class="transition-transform hover:scale-110"
            aria-label="Bridge USDT">
            <img
              src="https://gib.show/image/1/0xdac17f958d2ee523a2206206994597c13d831ec7"
              alt="USDT"
              class="w-6 h-6 rounded-full bg-white/10 animate-pulse"
              onload={handleImageLoad}
            />
          </button>
          <button
            type="button"
            onclick={() => handleTokenClick('0x6B175474E89094C44Da98b954EedeAC495271d0F')}
            class="transition-transform hover:scale-110"
            aria-label="Bridge DAI">
            <img
              src="https://gib.show/image/1/0x6B175474E89094C44Da98b954EedeAC495271d0F"
              alt="DAI"
              class="w-6 h-6 rounded-full bg-white/10 animate-pulse"
              onload={handleImageLoad}
            />
          </button>
          <button
            type="button"
            onclick={() => handleTokenClick('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')}
            class="transition-transform hover:scale-110"
            aria-label="Bridge WETH">
            <img
              src="https://gib.show/image/1/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
              alt="WETH"
              class="w-6 h-6 rounded-full bg-white/10 animate-pulse"
              onload={handleImageLoad}
            />
          </button>
          <span class="text-sm opacity-70">+ more</span>
        </div>
      </div>

      <Button
        onclick={handleGetStarted}
        class="dark:bg-slate-950 bg-surface-50 text-surface-950 dark:text-surface-50 hover:bg-surface-100 dark:hover:bg-slate-800 px-10 py-4 rounded-full text-xl font-medium flex flex-row items-center gap-2 mx-auto mt-6">
        Start Bridging
        <Icon icon="mdi:arrow-right" />
      </Button>
    </div>

  </div>
  <!-- Animated Arrow -->
  <div
    class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce transition-opacity duration-300"
    class:opacity-0={!toggle || !showArrow}
  >
    <Icon
      icon="mdi:chevron-down"
      class="text-white dark:text-surface-950 text-4xl"
    />
  </div>
</BlurryImage>

<style>
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .animate-bounce {
    animation: bounce 2s infinite;
  }
</style>

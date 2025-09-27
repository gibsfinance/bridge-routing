<script lang="ts">
  import BlurryImage from './BlurryImage.svelte'
  import { onMount } from 'svelte'
  import { innerWidth, innerHeight } from 'svelte/reactivity/window'
  import Icon from '@iconify/svelte'
  import Button from './Button.svelte'
  import * as nav from '../stores/nav.svelte'

  const payMe = 'images/pay-me.png'
  let toggle = $state(false)
  let showArrow = $state(true)
  onMount(() => {
    const id = setTimeout(() => {
      toggle = true
    }, 1000)

    // Updated scroll listener to hide arrow after 80px scroll
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
    nav.onboard.shallow()
  }
</script>

<BlurryImage height={isSmallHeight ? '600px' : "calc(100vh - 180px)"} image_url="url({payMe})">
  <div class="flex flex-col items-center justify-center h-fit gap-6 top-0 bottom-0 left-0 right-0 m-auto max-w-4xl px-4 relative text-white dark:text-slate-950">
    <h1
      class="font-italiana z-10 text-center text-8xl content-center flex grow justify-center justify-items-center h-24 transition-all duration-300 font-bold"
      class:translate-y-8={!toggle}>
      Gibs
    </h1>
    <div class="flex font-light text-center" class:gap-2={!isSmall} class:flex-col={isSmall} class:flex-row={!isSmall}>
      <span
        class="transition-all duration-300"
        class:translate-y-full={!toggle}
        class:opacity-0={!toggle}>Convenience.</span>
      <span
        class="transition-all italic duration-300 delay-700"
        class:translate-y-full={!toggle}
        class:opacity-0={!toggle}>For Pulsechain.</span>
    </div>
    <div class="text-center max-w-2xl transition-all duration-200 delay-1500"
      class:opacity-0={!toggle}>
      <p class="text-xl mb-6">The easiest way to bring assets to PulseChain.<br />Simple, secure, and user-friendly.</p>
      <Button
        onclick={handleGetStarted}
        class="dark:bg-slate-950 bg-surface-50 text-surface-950 dark:text-surface-50 hover:bg-surface-100 dark:hover:bg-slate-800 px-8 py-3 rounded-full text-lg font-medium flex flex-row items-center gap-2 mx-auto">
        Get Started
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

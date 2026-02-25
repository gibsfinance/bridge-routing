<script lang="ts">
  import Icon from '@iconify/svelte'
  import BlurryImage from './BlurryImage.svelte'
  import Button from './Button.svelte'
  import * as nav from '../stores/nav.svelte'

  const dashAfterCrypto = 'images/dash-after-crypto.jpg'

  const handleStartOnboarding = () => {
    nav.onboard.shallow()
  }
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
</script>

<div class="bg-slate-100 dark:bg-slate-950">
  <div class="container px-4 py-16 text-center m-auto text-surface-950 dark:text-surface-50 max-w-6xl">
    <h3 class="text-4xl md:text-5xl font-italiana font-bold mb-4">
      Quick Onboarding
    </h3>
    <p class="text-xl text-surface-700 dark:text-surface-300 max-w-3xl mx-auto">
      New to PulseChain? Bridge from Ethereum and optionally swap for PLS tokens in one flow
    </p>

    <!-- What it does -->
    <div class="mt-12 bg-white dark:bg-surface-950 rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
      <div class="flex flex-col md:flex-row items-center gap-8">
        <div class="flex-1 text-left">
          <h4 class="text-2xl font-semibold mb-4">What is Onboarding?</h4>
          <p class="text-surface-700 dark:text-surface-300 leading-relaxed">
            The onboarding flow is specifically designed for first-time PulseChain users. It guides you through:
          </p>
          <ul class="mt-4 space-y-3 text-surface-700 dark:text-surface-300">
            <li class="flex items-start gap-3">
              <Icon icon="mdi:arrow-right-circle" class="text-2xl flex-shrink-0 mt-0.5" />
              <span>Bridge your tokens from Ethereum to PulseChain</span>
            </li>
            <li class="flex items-start gap-3">
              <Icon icon="mdi:arrow-right-circle" class="text-2xl flex-shrink-0 mt-0.5" />
              <span>Optionally swap to PLS or other tokens on PulseX DEX</span>
            </li>
            <li class="flex items-start gap-3">
              <Icon icon="mdi:arrow-right-circle" class="text-2xl flex-shrink-0 mt-0.5" />
              <span>Get ready to use PulseChain DeFi</span>
            </li>
          </ul>
        </div>
        <div class="flex-shrink-0">
          <Icon icon="mingcute:run-fill" class="text-9xl text-surface-300 dark:text-surface-700" />
        </div>
      </div>
    </div>

    <!-- When to use -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div class="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
        <Icon icon="mdi:check-circle" class="text-3xl text-green-600 dark:text-green-400 mx-auto mb-3" />
        <h5 class="text-lg font-semibold mb-2">Use Onboarding If:</h5>
        <ul class="text-sm text-left space-y-2 text-surface-700 dark:text-surface-300">
          <li>✓ New to PulseChain</li>
          <li>✓ Bridging from Ethereum or BSC</li>
          <li>✓ Want to get PLS tokens automatically</li>
          <li>✓ Sending to a different wallet address</li>
        </ul>
      </div>

      <div class="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <Icon icon="mdi:information" class="text-3xl text-blue-600 dark:text-blue-400 mx-auto mb-3" />
        <h5 class="text-lg font-semibold mb-2">Use Regular Bridge If:</h5>
        <ul class="text-sm text-left space-y-2 text-surface-700 dark:text-surface-300">
          <li>✓ Already have native tokens (PLS, ETH, BNB)</li>
          <li>✓ Don't need to swap tokens after bridging</li>
          <li>✓ Only need a simple bridge transaction</li>
          <li>✓ Bridging to the same wallet address</li>
        </ul>
      </div>
    </div>

    <!-- CTA Buttons -->
    <div class="flex flex-col sm:flex-row justify-center gap-4 mt-12">
      <Button
        type="button"
        onclick={handleStartOnboarding}
        class="bg-surface-800 dark:bg-surface-200 text-white dark:text-surface-950 hover:bg-surface-700 dark:hover:bg-surface-300 px-8 py-3 rounded-full text-lg font-medium flex flex-row items-center gap-2 justify-center"
      >
        <Icon icon="mingcute:run-fill" />
        Start Onboarding
      </Button>
      <a
        href="/#/bridge"
        onclick={scrollToTop}
        class="bg-white dark:bg-surface-950 text-surface-950 dark:text-surface-50 hover:bg-surface-100 dark:hover:bg-surface-800 px-8 py-3 rounded-full text-lg font-medium flex flex-row items-center gap-2 justify-center border-2 border-surface-200 dark:border-surface-800"
      >
        <Icon icon="hugeicons:bridge" />
        Regular Bridge
      </a>
    </div>
  </div>
</div>

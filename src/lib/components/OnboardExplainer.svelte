<script lang="ts">
  import Icon from '@iconify/svelte'
  import BlurryImage from './BlurryImage.svelte'
  import Button from './Button.svelte'
  import * as nav from '../stores/nav.svelte'

  const dashAfterCrypto = 'images/dash-after-crypto.jpg'

  // Navigation handler
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

<div class="bg-slate-100 min-h-[200px] flex items-center">
  <div class="container px-4 py-12 text-center m-auto text-slate-950">
    <div class="max-w-4xl mx-auto">
      <h3 class="text-5xl font-italiana font-bold flex flex-row items-center gap-2 justify-center">
        <a href="#/onboard" onclick={scrollToTop} class="flex flex-row items-center gap-2">
          Onboard <Icon icon="mingcute:run-fill" class="text-4xl" />
        </a>
      </h3>
      <h4 class="text-2xl mt-4 text-slate-700">Bridge to PulseChain quickly and securely</h4>
    </div>
  </div>
</div>

<BlurryImage image_url="url({dashAfterCrypto})" min_height="auto">
  <div class="text-white p-8 text-shadow-lg">
    <div class="text-center mb-8">
      <p class="text-lg mt-2 font-light text-white/90 italic">
        Follow these simple steps to start your onboarding process.
      </p>
    </div>

    <div class="container m-auto max-w-6xl">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Step 1: Connect -->
        <div class="flex flex-col items-center text-center p-8 bg-white/10 rounded-xl">
          <Icon icon="mdi:wallet" class="text-5xl" />
          <h3 class="text-2xl font-medium mb-4">1. Connect Your Wallet</h3>
          <p class="text-lg leading-relaxed">
            Start by connecting your wallet. All major wallet providers are supported, making it easy to get started with your preferred option.
          </p>
        </div>

        <!-- Step 2: Select -->
        <div class="flex flex-col items-center text-center p-8 bg-white/10 rounded-xl">
          <Icon icon="mdi:swap-horizontal" class="text-5xl" />
          <h3 class="text-2xl font-medium mb-4">2. Select Your Tokens</h3>
          <p class="text-lg leading-relaxed">
            Choose the tokens you want to bridge. Gibs providers support a wide range of assets from multiple chains.
          </p>
        </div>

        <!-- Step 3: Bridge -->
        <div class="flex flex-col items-center text-center p-8 bg-white/10 rounded-xl">
          <Icon icon="mdi:bridge" class="text-5xl" />
          <h3 class="text-2xl font-medium mb-4">3. Bridge to PulseChain</h3>
          <p class="text-lg leading-relaxed">
            Complete the bridge transaction. Our system ensures a secure and efficient transfer to PulseChain.
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="flex justify-center mt-16">
        <Button
          type="button"
          onclick={handleStartOnboarding}
          class="bg-white text-slate-950 hover:bg-slate-100 px-8 py-3 rounded-full text-lg font-medium flex flex-row items-center gap-2"
        >
          Onboard Now
          <Icon icon="mdi:arrow-right" />
        </Button>
      </div>
    </div>
  </div>
</BlurryImage>

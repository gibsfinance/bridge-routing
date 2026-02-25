<script lang="ts">
  import Icon from '@iconify/svelte'
  import BlurryImage from './BlurryImage.svelte'
  import { scrollToTop } from '../utils.svelte'
  const futureBridge = 'images/future-bridge.webp'
</script>

<div class="bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 text-surface-950 dark:text-surface-50">
  <div class="px-4 py-16 text-center m-auto max-w-6xl">
    <h3 class="text-4xl md:text-5xl font-italiana font-bold mb-4">
      How It Works
    </h3>
    <p class="text-xl text-surface-700 dark:text-surface-300 max-w-3xl mx-auto">
      Securely transfer your tokens between blockchains in just a few steps
    </p>

    <!-- Steps -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
      <div class="relative">
        <div class="bg-white dark:bg-surface-950 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <Icon icon="mdi:wallet-outline" class="text-5xl text-surface-800 dark:text-surface-200 mx-auto mb-4" />
          <h5 class="text-2xl font-semibold mb-3">Connect & Select</h5>
          <p class="text-surface-700 dark:text-surface-300">
            Connect your wallet, choose the token and amount you want to bridge, and select the destination chain
          </p>
        </div>
      </div>

      <div class="relative">
        <div class="bg-white dark:bg-surface-950 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <Icon icon="mdi:check-decagram" class="text-5xl text-surface-800 dark:text-surface-200 mx-auto mb-4" />
          <h5 class="text-2xl font-semibold mb-3">Confirm</h5>
          <p class="text-surface-700 dark:text-surface-300">
            Review the bridge details including fees and estimated arrival time, then approve the transaction
          </p>
        </div>
      </div>

      <div class="relative">
        <div class="bg-white dark:bg-surface-950 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <Icon icon="mdi:clock-fast" class="text-5xl text-surface-800 dark:text-surface-200 mx-auto mb-4" />
          <h5 class="text-2xl font-semibold mb-3">Wait & Receive</h5>
          <p class="text-surface-700 dark:text-surface-300">
            Wait approximately 30 minutes while validators confirm your transaction. Your tokens arrive on the destination chain
          </p>
        </div>
      </div>
    </div>

    <!-- Advanced Features -->
    <div class="mt-16">
      <h4 class="text-3xl font-semibold mb-8">Advanced Features</h4>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-surface-950 p-6 rounded-xl shadow-sm">
          <Icon icon="mdi:target" class="text-3xl text-surface-800 dark:text-surface-200 mx-auto mb-3" />
          <h5 class="text-xl font-semibold mb-2">Custom Destination</h5>
          <p class="text-surface-700 dark:text-surface-300 text-sm">Send tokens directly to any address, perfect for cold storage or exchange deposits</p>
        </div>

        <div class="bg-white dark:bg-surface-950 p-6 rounded-xl shadow-sm">
          <Icon icon="mdi:gas-station-outline" class="text-3xl text-surface-800 dark:text-surface-200 mx-auto mb-3" />
          <h5 class="text-xl font-semibold mb-2">Token Delivery</h5>
          <p class="text-surface-700 dark:text-surface-300 text-sm">Skip pre-funding destination wallets — pay delivery fees in any token</p>
        </div>

        <div class="bg-white dark:bg-surface-950 p-6 rounded-xl shadow-sm">
          <Icon icon="mdi:history" class="text-3xl text-surface-800 dark:text-surface-200 mx-auto mb-3" />
          <h5 class="text-xl font-semibold mb-2">Track History</h5>
          <p class="text-surface-700 dark:text-surface-300 text-sm">Monitor all your bridge transactions with real-time status updates</p>
        </div>
      </div>
    </div>
  </div>
</div>

<BlurryImage image_url="url({futureBridge})" min_height="auto">
  <div class="text-white dark:text-surface-950 py-16 px-4 max-w-6xl mx-auto text-base">
    <div class="space-y-12 text-shadow-lg dark:text-shadow-none">
      <div class="text-center">
        <h5 class="text-4xl font-semibold mb-4">Why Use Gibs Bridge?</h5>
        <p class="text-xl font-light italic">
          Secure, fast, and user-friendly cross-chain transfers
        </p>
      </div>

      <!-- Benefits Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div class="flex items-start gap-4 bg-white/10 dark:bg-surface-950/40 p-6 rounded-xl backdrop-blur-sm">
          <Icon icon="mdi:shield-lock" class="text-4xl flex-shrink-0 mt-1" />
          <div>
            <h6 class="text-xl font-semibold mb-2">Cryptographic Security</h6>
            <p>Secured by blockchain cryptography using the official bridge infrastructure. Funds pass through one routing contract and don't remain there unless delivery fails.</p>
          </div>
        </div>

        <div class="flex items-start gap-4 bg-white/10 dark:bg-surface-950/40 p-6 rounded-xl backdrop-blur-sm">
          <Icon icon="mdi:cash-fast" class="text-4xl flex-shrink-0 mt-1" />
          <div>
            <h6 class="text-xl font-semibold mb-2">Choose Your Own Fees</h6>
            <p>Control what features you pay for - automatic delivery requires sufficient fees, or bridge manually to save costs. All fees shown upfront, no hidden charges.</p>
          </div>
        </div>

        <div class="flex items-start gap-4 bg-white/10 dark:bg-surface-950/40 p-6 rounded-xl backdrop-blur-sm">
          <Icon icon="mdi:check-all" class="text-4xl flex-shrink-0 mt-1" />
          <div>
            <h6 class="text-xl font-semibold mb-2">Full Control</h6>
            <p>Non-custodial bridge means you always maintain control of your assets. Can switch to other bridge UIs at any time.</p>
          </div>
        </div>

        <div class="flex items-start gap-4 bg-white/10 dark:bg-surface-950/40 p-6 rounded-xl backdrop-blur-sm">
          <Icon icon="mdi:star-four-points" class="text-4xl flex-shrink-0 mt-1" />
          <div>
            <h6 class="text-xl font-semibold mb-2">Battle-Tested</h6>
            <p>Built on proven bridge protocols that have transferred millions in value. Trusted by the PulseChain community.</p>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center mt-16">
        <a href="/#/bridge" onclick={scrollToTop} class="inline-flex items-center gap-3 bg-white/20 dark:bg-surface-950/60 hover:bg-white/30 dark:hover:bg-surface-950/80 backdrop-blur-sm text-white dark:text-surface-50 px-10 py-4 rounded-full transition-all text-xl font-semibold shadow-lg hover:shadow-xl">
          Start Bridging Now
          <Icon icon="mdi:arrow-right" class="text-2xl" />
        </a>
      </div>
    </div>
  </div>
</BlurryImage>

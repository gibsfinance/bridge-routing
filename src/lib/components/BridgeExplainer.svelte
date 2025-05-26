<script lang="ts">
  import Icon from '@iconify/svelte'
  import BlurryImage from './BlurryImage.svelte'
  import { scrollToTop } from '../utils.svelte'
  const futureBridge = 'images/future-bridge.webp'
</script>

<div class="bg-gradient-to-b from-slate-100 to-white">
  <div class="px-4 py-16 text-center m-auto text-slate-950">
    <a href="#/delivery" onclick={scrollToTop} class="group">
      <h3 class="text-5xl font-italiana font-bold flex flex-row items-center gap-3 justify-center">
        Token Delivery
        <Icon icon="hugeicons:bridge" class="text-tertiary-600" />
      </h3>
    </a>
    <h4 class="text-2xl mt-4 text-slate-700">Bridge-Level Security, Enhanced Convenience</h4>

    <!-- Feature Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <Icon icon="mdi:shield-check" class="text-3xl text-tertiary-600 mx-auto mb-4" />
        <h5 class="text-xl font-semibold mb-2">Bridge-Level Security</h5>
        <p class="text-slate-600">Same security as the underlying bridge with no additional risk</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <Icon icon="mdi:gas-station" class="text-3xl text-tertiary-600 mx-auto mb-4" />
        <h5 class="text-xl font-semibold mb-2">Gas Efficient</h5>
        <p class="text-slate-600">Skip pre-funding destination wallets to save on gas fees</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <Icon icon="mdi:swap-horizontal" class="text-3xl text-tertiary-600 mx-auto mb-4" />
        <h5 class="text-xl font-semibold mb-2">Flexible Payments</h5>
        <p class="text-slate-600">Pay in any token, not just native tokens like Ether</p>
      </div>
    </div>
  </div>
</div>

<BlurryImage image_url="url({futureBridge})" min_height="auto">
  <div class="text-white py-12 px-4 max-w-6xl mx-auto text-base">
    <div class="space-y-12 text-shadow-lg">
      <div class="text-center mb-8">
        <h5 class="text-3xl font-semibold">How Delivery Works</h5>
        <p class="text-lg mt-2 font-light text-white/90 italic">
          Move to and from PulseChain securely and efficiently
        </p>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Left Column: Description -->
        <div class="space-y-6">
          <p class="text-lg">
            Token Delivery enhances the PulseChain to EVM bridge experience by adding convenience without compromising security. Built on the same trusted bridge infrastructure, it offers additional features while maintaining bridge-level security.
          </p>
          <p class="text-lg">
            By eliminating the need to pre-fund destination wallets, users can save on gas fees and time while maintaining full control of their assets throughout the process.
          </p>
        </div>

        <!-- Right Column: Features -->
        <div class="space-y-6">
          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <Icon icon="mdi:check-circle" class="mt-1 flex-shrink-0" />
              <span>Direct transfers to your preferred destination without pre-funding</span>
            </li>
            <li class="flex items-start gap-3">
              <Icon icon="mdi:check-circle" class="mt-1 flex-shrink-0" />
              <span>Pay delivery fees in any token, not just native tokens</span>
            </li>
            <li class="flex items-start gap-3">
              <Icon icon="mdi:check-circle" class="mt-1 flex-shrink-0" />
              <span>Fallback to standard bridge UI available at any time</span>
            </li>
          </ul>
        </div>
      </div>
      <!-- Summary Points -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
        <div class="flex flex-col items-center">
          <Icon icon="mdi:ghost-off" class="text-4xl text-white mb-2" />
          <span class="text-lg text-white">No Extra Risk</span>
        </div>
        <div class="flex flex-col items-center">
          <Icon icon="mdi:shield-check" class="text-4xl text-white mb-2" />
          <span class="text-lg text-white">Same Security</span>
        </div>
        <div class="flex flex-col items-center">
          <Icon icon="mdi:gesture-tap" class="text-4xl text-white mb-2" />
          <span class="text-lg text-white">Full Control</span>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center mt-12">
        <a href="/#/delivery" class="inline-flex items-center gap-2 bg-tertiary-600 hover:bg-tertiary-700 text-white px-8 py-3 rounded-full transition-colors text-lg">
          Try Token Delivery
          <Icon icon="mdi:arrow-right" />
        </a>
      </div>
    </div>
  </div>
</BlurryImage>

<script lang="ts">
  import BluryImage from './BluryImage.svelte'
  import futureBridge from '$lib/images/future-bridge.webp'
</script>

<div class="container px-2 py-10 text-center m-auto text-slate-950">
  <h3 class="text-5xl font-italiana">Ether delivery</h3>
  <h4 class="text-2xl mt-4">protect your privacy, keep custody of your tokens</h4>
</div>

<BluryImage image_url={futureBridge} blur="6px" opacity="0.7" min_height="auto">
  <div class="text-white">
    <div class="container px-2 py-10 m-auto text-xl text-center">
      <!-- <img src={futureBridge} class="float-right max-w-96" alt="" /> -->
      <p class="mt-8 text-left">
        Introducing "Ether delivery" for PulseChain to Ethereum bridges. With a minimal
        implementations, and commitment to security, <a href="bridge" class="underline"
          >gibs.finance/bridge</a> simplifies bridging to Ethereum while supporting user privacy.
      </p>
      <p class="mt-8 text-left">
        Through its minimalist design, gibs.finance eliminates the need for users to pre-fund
        recipient wallets, reducing associated expenses and streamlining transactions. This unique
        feature ensures gas savings and enhances user privacy by eliminating the need to fund the
        address on Ethereum from other addresses.
      </p>
      <p class="mt-8 text-left">
        At Gibs.finance, user security is paramount. The contracts keep users in control of their
        funds at all times. Even if the delivery service's signing capabilities are disabled, users
        can always get their tokens out by completing the bridge as they normally would via the
        bridge.pulsechain.com ui, maintaining risk comparable to using the bridge directly.
      </p>
      <p class="mt-8 text-left">
        This approach mitigates potential vulnerabilities associated with custodial services,
        providing users with confidence in the security of their assets. Bridge trustlessly,
        quickly, and maintain your privacy without permission on <a href="bridge" class="underline"
          >gibs.finance/bridge</a
        >.
      </p>
    </div>
  </div>
</BluryImage>
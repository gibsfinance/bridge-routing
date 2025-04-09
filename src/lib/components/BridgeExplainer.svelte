<script lang="ts">
  import BlurryImage from './BlurryImage.svelte'
  import VersionedLink from './VersionedLink.svelte'
  import futureBridge from '../../../public/images/future-bridge.webp'
</script>

<div class="bg-slate-100">
  <div class="container px-2 py-10 text-center m-auto text-slate-950">
    <h3 class="text-5xl font-italiana font-bold">Token Delivery</h3>
    <h4 class="text-2xl mt-4">Trustless, decentralised token delivery</h4>
  </div>
</div>

<BlurryImage image_url="url({futureBridge})" blur="9px" brightness="50%" min_height="auto">
  <div class="text-white py-8 px-4">
    <div class="container m-auto text-xl text-center drop-shadow-lg sm:max-w-3xl">
      <p class="text-left">
        Introducing "Token Delivery" for PulseChain to EVM Omnibridges. With a minimal
        implementations, and commitment to security, Gibs offers a seamless experience for users
        crossing between chains.
      </p>
      <p class="mt-4 sm:mt-8 text-left">
        Gibs eliminates the need for users to pre-fund recipient wallets, reducing associated
        expenses and saving you time. This feature ensures gas savings and enhances user privacy by
        eliminating the need to fund the destination from other addresses that may require exposure
        of identifying information. The contracts allow users to pay in tokens that are not native
        tokens, such as Ether. This allows users to transfer from Pulsechain directly to their
        preferred off-ramp provider.
      </p>
      <p class="mt-4 sm:mt-8 text-left">
        At Gibs.finance, user security is paramount. The contracts keep users in control of their
        funds at all times. Even if the delivery service's signing capabilities are disabled, users
        can always get their tokens out by completing the bridge as they normally would via the <VersionedLink
          domain="bridge.pulsechain.com" /> ui, meaning there is no extra risk of losing your tokens.
      </p>
      <p class="mt-4 sm:mt-8 text-left">
        This approach mitigates potential vulnerabilities associated with custodial services,
        providing users with confidence in the security of their assets. Bridge trustlessly,
        quickly, and maintain your privacy without permission on <a
          href="/#/delivery"
          class="underline">gibs.finance</a
        >.
      </p>
    </div>
  </div>
</BlurryImage>

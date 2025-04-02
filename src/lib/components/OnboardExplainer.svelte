<script lang="ts">
  import BlurryImage from './BlurryImage.svelte'
  import LifiLink from './LifiLink.svelte'
  const dashAfterCrypto = new URL('/images/dash-after-crypto.jpg', import.meta.url).href
</script>

<div class="bg-slate-100">
  <div class="container px-2 py-10 text-center m-auto text-slate-950">
    <h3 class="text-5xl font-italiana font-bold">Onboard</h3>
    <h4 class="text-2xl mt-4">move tokens from any chain to PulseChain</h4>
  </div>
</div>

<BlurryImage image_url="url({dashAfterCrypto})" blur="9px" brightness="50%" min_height="auto">
  <div class="text-white py-8 px-4">
    <div class="container m-auto text-xl drop-shadow-lg sm:max-w-3xl gap-8 flex flex-col text-left">
      <p
        >The latest updates to gibs.finance include onramping pathways for users to onboard to
        PulseChain with just a few clicks of a button. In order to move from anywhere in the crypto
        ecosystem, solutions like <LifiLink /> and other onramping tools are utilized to ensure minimal
        risk and optimal price. We can provide users with a seamless and efficient way to transfer assets
        to PulseChain.</p>
      <p class="items-center"
        >Because of <LifiLink /> support for multiple types of chains, such as Bitcoin and Solana, the
        process for bridging to PulseChain has never been easier.</p>
      <p
        >To enhance the user experience, we've developed a unified interface that guides users
        through the entire process. This single, cohesive view eliminates confusion by consolidating
        all steps in one place. Whether users are new to blockchain or experienced, this solution
        ensures a straightforward journey to bridge their assets to PulseChain.</p>
    </div>
  </div>
</BlurryImage>

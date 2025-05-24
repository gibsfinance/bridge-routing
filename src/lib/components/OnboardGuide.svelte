<script lang="ts">
  import GuideShield from "./GuideShield.svelte"
  import GuideStep from "./GuideStep.svelte"

  const { bridgingToPulsechain }: { bridgingToPulsechain: boolean } = $props()
</script>
<div class="absolute top-0 left-0 w-full h-full z-10">
  <GuideShield show={true} />
  {#if bridgingToPulsechain}
    <GuideStep step={1} triggerClass="absolute right-24 top-8">
      <p>Onramp funds</p>
    </GuideStep>
    <GuideStep step={2} triggerClass="absolute left-24 top-28">
      <p>Select the token you wish to bridge to PulseChain.</p>
    </GuideStep>
    <GuideStep step={3} triggerClass="absolute right-24 bottom-4">
      <p>Trigger the bridge to PulseChain.</p>
    </GuideStep>
  {:else}
    <GuideStep step={1} triggerClass="absolute right-24 top-44">
      <p>Select the token you wish to swap from.</p>
    </GuideStep>
    <GuideStep step={2} triggerClass="absolute right-24 bottom-4">
      <p>Trigger the swap on PulseX.</p>
    </GuideStep>
  {/if}
</div>

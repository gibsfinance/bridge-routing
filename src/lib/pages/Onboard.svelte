<script lang="ts">
  import BlurryImage from '../components/BlurryImage.svelte'
  import { windowStore } from '../stores/window.svelte'
  import Onboard from '../components/Onboard.svelte'
  import OnboardSettings from '../components/OnboardSettings.svelte'
  import Headline from '../components/Headline.svelte'
  import { activeOnboardStep } from '../stores/storage.svelte'
  const onboardImageFuzzy = 'images/runners.jpg'
  const onboardActive = $derived(activeOnboardStep.value === 1)
  const swapActive = $derived(activeOnboardStep.value === 2)
</script>

<div class="flex flex-col w-full">
  <div class="flex w-full">
    <BlurryImage
      min_height={windowStore.large ? 'calc(100vh - 40px)' : 'auto'}
      image_url="url({onboardImageFuzzy})"
      blur="12px"
      brightness="90%">
      <div class="flex flex-col text-lg w-full gap-4">
        <div class="my-16 max-w-lg mx-auto w-full">
          <Headline
            ><button
              type="button"
              onclick={() => {
                activeOnboardStep.value = 1
              }}
              class:opacity-70={!onboardActive}>Onboard</button
            >/<button
              type="button"
              onclick={() => {
                activeOnboardStep.value = 2
              }}
              class:opacity-70={!swapActive}>Swap</button
            ></Headline>
          <OnboardSettings />
          <Onboard />
        </div>
      </div>
    </BlurryImage>
  </div>
</div>

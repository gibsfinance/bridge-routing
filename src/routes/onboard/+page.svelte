<script lang="ts">
  import BlurryImage from '$lib/components/BlurryImage.svelte'
  import { windowStore } from '$lib/stores/window.svelte'
  import Onboard from '$lib/components/Onboard.svelte'
  import OnboardSettings from '$lib/components/OnboardSettings.svelte'
  const onboardImageFuzzy = new URL('/images/runners.jpg', import.meta.url).href
</script>

<svelte:head>
  <title>Onboarding</title>
</svelte:head>

<div class="flex flex-col w-full">
  <div class="flex w-full">
    <BlurryImage
      min_height={windowStore.large ? 'calc(100vh - 40px)' : 'auto'}
      image_url="url({onboardImageFuzzy})"
      blur="12px"
      brightness="90%">
      <div class="flex flex-col text-lg w-full gap-4 mb-16">
        <div class="mt-16 max-w-lg mx-auto w-full">
          <OnboardSettings />
          <Onboard />
        </div>
      </div>
    </BlurryImage>
  </div>
</div>

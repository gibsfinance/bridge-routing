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
      brightness="50%">
      <div class="flex flex-col text-lg w-full px-2 gap-4 mb-16">
        <div class="mt-8 max-w-lg mx-auto w-full">
          <h1
            class="text-white font-italiana top-0 bottom-0 left-0 right-0 text-center content-center capitalize text-5xl">
            onboard
          </h1>
          <OnboardSettings />
          <Onboard />
        </div>
      </div>
    </BlurryImage>
  </div>
</div>

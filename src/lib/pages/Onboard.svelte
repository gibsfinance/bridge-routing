<script lang="ts">
  import BlurryImage from '../components/BlurryImage.svelte'
  import { windowStore } from '../stores/window.svelte'
  import Onboard from '../components/Onboard.svelte'
  import OnboardSettings from '../components/OnboardSettings.svelte'
  import Headline from '../components/Headline.svelte'

  const onboardImageFuzzy = new URL('/images/runners.jpg', import.meta.url).href
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
          <Headline>Onboard</Headline>
          <OnboardSettings />
          <Onboard />
        </div>
      </div>
    </BlurryImage>
  </div>
</div>

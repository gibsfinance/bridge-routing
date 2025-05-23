<script lang="ts">
  import BlurryImage from '../components/BlurryImage.svelte'
  import { windowStore } from '../stores/window.svelte'
  import Onboard from '../components/Onboard.svelte'
  import OnboardSettings from '../components/OnboardSettings.svelte'
  import Headline from '../components/Headline.svelte'
  import { activeOnboardStep } from '../stores/storage.svelte'
  import { page } from '../stores/page.svelte'
  import SizeNotifier from '../components/SizeNotifier.svelte'
  import EmbedSettings from '../components/EmbedSettings.svelte'

  const onboardImageFuzzy = 'images/runners.jpg'
  const onboardActive = $derived(activeOnboardStep.value === 1)
  const swapActive = $derived(activeOnboardStep.value === 2)
</script>

<div class="flex flex-col w-full">
  <div class="flex w-full">
    <BlurryImage
      min_height={page.embed ? '100vh' : windowStore.large ? 'calc(100vh - 40px)' : 'auto'}
      image_url="url({onboardImageFuzzy})"
      blur="12px"
      brightness="90%">
      <SizeNotifier class="flex flex-row text-lg w-full gap-4 mx-auto justify-center">
        <div class="max-w-lg w-full flex flex-col" class:m-4={page.embed} class:my-16={!page.embed} class:justify-center={page.embed}>
          {#if !page.embed || page.mode !== 'simple'}
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
          {/if}
          {#if !page.embed || (page.mode !== 'simple')}
            <OnboardSettings />
          {/if}
          <Onboard />
        </div>
      </SizeNotifier>
    </BlurryImage>
  </div>
</div>

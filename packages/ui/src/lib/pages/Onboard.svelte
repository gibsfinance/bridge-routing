<script lang="ts">
  import BlurryImage from '../components/BlurryImage.svelte'
  import { windowStore } from '../stores/window.svelte'
  import Onboard from '../components/Onboard.svelte'
  import OnboardSettings from '../components/OnboardSettings.svelte'
  import Headline from '../components/Headline.svelte'
  import { page } from '../stores/app-page.svelte'
  import SizeNotifier from '../components/SizeNotifier.svelte'
  import * as settings from '../stores/settings.svelte'

  const onboardImageFuzzy = 'images/runners.jpg'
  const onboardActive = $derived(!page.stage)
  const swapActive = $derived(page.stage === 'swap')
</script>

<div class="flex flex-col w-full">
  <div class="flex w-full text-white dark:text-slate-950">
    <BlurryImage
      min_height={page.embed ? '100vh' : windowStore.large ? 'calc(100vh - 40px)' : 'auto'}
      image_url="url({onboardImageFuzzy})">
      <SizeNotifier class="flex flex-row text-lg w-full gap-4 mx-auto justify-center">
        <div class="max-w-lg w-full flex flex-col" class:m-1={page.embed} class:my-16={!page.embed} class:justify-center={page.embed}>
          {#if !page.embed || page.mode !== 'simple'}
          <Headline
            ><button
              type="button"
              class:opacity-70={!onboardActive}
              onclick={() => {
                page.setParam('stage', settings.stage.ONBOARD)
              }}>Onboard</button
            >/<button
              type="button"
              class:opacity-70={!swapActive}
              onclick={() => {
                page.setParam('stage', settings.stage.SWAP)
              }}>Swap</button
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

<script lang="ts">
  import Icon from '@iconify/svelte'
  import { details } from '../stores/settings.svelte'
  import { page } from '../stores/app-page.svelte'
  import Button from './Button.svelte'
  import type { ClassValue } from 'svelte/elements'

  const { bgClass = '', sizeClass = 'size-9', roundedClass = 'rounded-full' }: { bgClass?: ClassValue, sizeClass?: ClassValue, roundedClass?: ClassValue } = $props()
  const className = $derived(`flex items-center justify-center ${bgClass} ${sizeClass} ${roundedClass}`)
  const showingDetails = $derived(page.details === details.SHOW)
</script>

<Button
  class={className}
  onclick={() => {
    page.setParam('details', showingDetails ? details.CLOSED : details.SHOW)
  }}>
  <div class="border-2 transition-all duration-100 rounded-full" class:border-transparent={!showingDetails} class:rotate-45={showingDetails}>
    <Icon
      icon="material-symbols:settings-outline-rounded"
      class="transition-all duration-100 {showingDetails ? 'size-7' : 'size-8'}" />
  </div>
</Button>

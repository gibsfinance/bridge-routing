<script lang="ts">
  import { activeOnboardStep } from '../stores/storage.svelte'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import type { ClassValue } from 'svelte/elements'
  type Props = {
    step: number
    justifyClass?: ClassValue
    sizeClass?: ClassValue
  }
  const {
    step,
    justifyClass,
    sizeClass = 'w-5 h-full flex items-center justify-center',
  }: Props = $props()
  const isActive = $derived(activeOnboardStep.value >= step)
  const classes = $derived([sizeClass, justifyClass])
</script>

<Button class={classes} onclick={() => (activeOnboardStep.value = step)}>
  <Icon
    icon="rivet-icons:chevron-right"
    class="h-3.5 w-3.5 text-surface-800 {isActive ? '' : 'opacity-75'}" />
</Button>

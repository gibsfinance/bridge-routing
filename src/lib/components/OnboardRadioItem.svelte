<script lang="ts">
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'
  import type { ClassValue } from 'svelte/elements'
  type Props = {
    step: string
    steps: string[]
    justifyClass?: ClassValue
    sizeClass?: ClassValue
    onupdate: (step: string) => void
  }
  const {
    step,
    steps,
    justifyClass,
    sizeClass = 'w-5 h-full flex items-center justify-center',
    onupdate,
  }: Props = $props()
  const index = $derived(steps.indexOf(step))
  const isActive = $derived(index <= index)
  const classes = $derived([sizeClass, justifyClass])
</script>

<Button class={classes} onclick={() => onupdate(step)}>
  <Icon
    icon="rivet-icons:chevron-right"
    class="h-3.5 w-3.5 text-surface-800 {isActive ? '' : 'opacity-75'}" />
</Button>

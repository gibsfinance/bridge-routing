<script lang="ts">
  import type { Snippet } from 'svelte'
  import ExchangeInputDivider from './ExchangeInputDivider.svelte'
  import Icon from '@iconify/svelte'
  import { activeOnboardStep } from '$lib/stores/storage.svelte'

  type Props = {
    icon: string
    step: number
    input: Snippet
    output: Snippet
    button: Snippet
    ondividerclick?: () => void
  }
  const { icon, step, input, output, button, ondividerclick }: Props = $props()
</script>

<div class="flex relative">
  <div class="w-full relative flex flex-col gap-2">
    <div class="flex flex-col relative gap-2">
      <div
        class="flex grow w-full card preset-outline-surface-500 bg-surface-950-50 overflow-hidden shadow-sm border hover:shadow-md transition-all duration-100">
        {@render input()}
      </div>
      <div
        class="flex grow w-full card preset-outline-surface-500 bg-surface-950-50 overflow-hidden shadow-sm border hover:shadow-md transition-all duration-100">
        {@render output()}
      </div>
      <ExchangeInputDivider
        onclick={ondividerclick}
        positionClasses="absolute top-1/2 left-0 -translate-y-1/2">
        <Icon
          {icon}
          class="rounded-full w-full h-full ring-2 ring-current text-surface-500 ring-inset p-2 bg-surface-950-50" />
      </ExchangeInputDivider>
    </div>
    {@render button()}
  </div>
</div>

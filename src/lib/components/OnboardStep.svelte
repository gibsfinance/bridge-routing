<script lang="ts">
  import type { Snippet } from 'svelte'
  import ExchangeInputDivider from './ExchangeInputDivider.svelte'
  import Icon from '@iconify/svelte'

  type Props = {
    icon: string
    input: Snippet
    output: Snippet
    button: Snippet
    progress?: Snippet
    ondividerclick?: null | (() => void)
  }
  const { icon, input, output, button, progress, ondividerclick }: Props = $props()
</script>

<div class="flex relative">
  <div class="w-full relative flex flex-col gap-2">
    <div class="flex flex-col relative gap-1">
      <div
        class="flex grow w-full order-1 card rounded-2xl preset-outline-surface-500 bg-surface-950-50 overflow-hidden shadow border hover:shadow-md transition-all duration-100">
        {@render input()}
      </div>
      <div
        class="flex grow order-3 w-full card rounded-2xl preset-outline-surface-500 bg-surface-950-50 overflow-hidden shadow border hover:shadow-md transition-all duration-100">
        {@render output()}
      </div>
      <ExchangeInputDivider onclick={ondividerclick} positionClasses="flex order-2">
        <Icon
          {icon}
          class="rounded-full w-full h-full ring-4 text-surface-contrast-100 ring-inset ring-white p-2 bg-surface-900-100 border {!!ondividerclick
            ? 'shadow hover:shadow-md transition-all duration-100'
            : ''}" />
      </ExchangeInputDivider>
    </div>
    {@render progress?.()}
    {@render button()}
  </div>
</div>

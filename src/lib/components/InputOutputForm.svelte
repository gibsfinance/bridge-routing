<script lang="ts">
  import type { Snippet } from 'svelte'
  type Props = {
    icon: string
    input: Snippet
    output: Snippet
    info?: Snippet
    button: Snippet
    progress?: Snippet
    divider?: Snippet
    ondividerclick?: null | (() => void)
  }
  const { input, output, info, button, progress, divider }: Props = $props()
  const classes = 'flex grow w-full card rounded-2xl preset-outline-surface-500 bg-surface-950-50'
</script>

<div class="flex relative">
  <div class="w-full relative flex flex-col gap-2">
    <div class="flex flex-col relative gap-1">
      <div class="{classes} order-1">
        {@render input()}
      </div>
      <div class="{classes} order-3">
        {@render output()}
      </div>
      {@render divider?.()}
    </div>
    {@render info?.()}
    {@render progress?.()}
    {@render button()}
  </div>
</div>

<script lang="ts">
  import type { ClassParam } from '$lib/types.svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
    id: string
    focused?: boolean
    disabled?: boolean
    class?: ClassParam
    compressed?: boolean
    onclick?: () => void
  }
  const {
    children,
    id,
    focused = false,
    disabled = false,
    class: className = '',
    compressed = false,
    onclick = () => {},
  }: Props = $props()
</script>

<label
  for={id}
  class="flex flex-col items-center justify-items-end grow gap-1 rounded-2xl shadow-inset justify-between w-full text-surface-contrast-50 border transition-all duration-100 preset-outline-surface-500 relative {className} {compressed
    ? 'px-4 py-1'
    : 'px-4 py-2.5'}"
  class:shadow={focused}
  class:hover:shadow-md={focused}
  class:bg-white={focused}
  class:bg-surface-950-50={!focused}
  class:cursor-not-allowed={disabled}
  {onclick}
  onkeypress={() => {}}>
  <div class="flex relative items-center flex-col w-full gap-1">
    {@render children()}
  </div>
</label>

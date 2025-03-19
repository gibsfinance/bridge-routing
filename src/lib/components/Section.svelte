<script lang="ts">
  import type { ClassParam } from '$lib/types.svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
    id: string
    focused?: boolean
    disabled?: boolean
    class?: ClassParam
  }
  const { children, id, focused = false, disabled = false, class: className = '' }: Props = $props()
</script>

<label
  for={id}
  class="flex flex-col items-center justify-items-end grow gap-1 rounded-2xl shadow-inset justify-between w-full text-surface-contrast-50 border transition-all duration-100 preset-outline-surface-500 relative p-4 {className}"
  class:shadow={focused}
  class:hover:shadow-md={focused}
  class:bg-white={focused}
  class:bg-surface-950-50={!focused}
  class:cursor-not-allowed={disabled}>
  <div class="flex relative items-center flex-col w-full gap-2">
    {@render children()}
  </div>
</label>

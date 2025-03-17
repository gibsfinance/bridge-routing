<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
    id: string
    focused?: boolean
    disabled?: boolean
  }
  const { children, id, focused = false, disabled = false, class: className = '' }: Props = $props()
</script>

<!-- text-surface-contrast-50 overflow-hidden shadow border hover:shadow-md transition-all duration-100 -->
<label
  for={id}
  class="flex flex-col items-center justify-items-end grow gap-1 rounded-2xl shadow-inset justify-between w-full text-surface-contrast-50 shadow border hover:shadow-md transition-all duration-100 preset-outline-surface-500 relative p-4 {className}"
  class:bg-white={focused}
  class:bg-surface-950-50={!focused}
  class:cursor-not-allowed={disabled}>
  <div class="flex relative items-center flex-col w-full gap-2">
    {@render children()}
  </div>
</label>

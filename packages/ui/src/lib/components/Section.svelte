<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type Props = {
    children: Snippet
    id: string
    focused?: boolean
    disabled?: boolean
    class?: ClassValue
    flexClass?: ClassValue
    compressed?: boolean
    onclick?: () => void
  }
  const {
    children,
    id,
    focused = false,
    disabled = false,
    class: className = '',
    flexClass = 'flex flex-col',
    compressed = false,
    onclick = () => {},
  }: Props = $props()
</script>

<label
  for={id} class="w-full flex">
  <div
    class="items-center justify-items-end grow gap-1 rounded-2xl shadow-inset justify-between w-full border transition-all duration-100 relative {className} {compressed
      ? 'px-4 py-1'
      : 'px-4 py-2.5'} {flexClass}"
    class:shadow={focused}
    class:hover:shadow-md={focused}
    class:bg-white={focused}
    class:dark:bg-slate-950={focused}
    class:bg-surface-50={!focused}
    class:dark:bg-transparent={!focused}
    class:cursor-not-allowed={disabled}
    class:dark:border-surface-700={!disabled}
    class:dark:border-transparent={disabled}
    class:dark:border-surface-100={!disabled}
    class:dark:text-surface-400={disabled}
    {onclick}
    onkeydown={() => {}}
    role="button" tabindex="-1">
    {@render children()}
  </div>
</label>

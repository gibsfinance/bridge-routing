<script lang="ts">
  type Props = {
    screenReaderText?: string
    checked?: boolean
    onchange?: (checked: boolean) => void
  }
  let { screenReaderText = 'setting', checked = false, onchange }: Props = $props()
</script>

<button
  type="button"
  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent dark:bg-gray-600 transition-colors duration-200 ease-in-out focus:outline-hidden"
  class:bg-gray-200={!checked}
  class:bg-tertiary-600={checked}
  class:dark:bg-gray-600={!checked}
  role="switch"
  onclick={() => {
    checked = !checked
    onchange?.(checked)
  }}
  aria-checked={checked}>
  <span class="sr-only">{screenReaderText}</span>
  <span
    aria-hidden="true"
    class:translate-x-0={!checked}
    class:translate-x-5={checked}
    class:bg-white={!checked}
    class:dark:bg-white={checked}
    class="pointer-events-none inline-block h-5 w-5 translate-x-0 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out"
  ></span>
</button>

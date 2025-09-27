<script lang="ts">
  import Icon from '@iconify/svelte'
  import { theme } from '../stores/theme.svelte'
</script>

<button
  type="button"
  class="flex flex-row items-center px-2 py-1 gap-1 cursor-pointer"
  onclick={() => theme.toggle()}
  aria-label={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  title={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
  <Icon icon={theme.isDark ? 'lucide:sun' : 'lucide:moon'} height="1.2em" width="1.2em" />
</button>

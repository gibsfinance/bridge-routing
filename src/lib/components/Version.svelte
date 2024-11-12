<script lang="ts">
  import * as env from '$app/environment'
  import { page } from '$app/stores'
  import { hover } from '$lib/modifiers/hover'
  import Hover from './Hover.svelte'
  import Tooltip from './Tooltip.svelte'
  const appVersion = __APP_VERSION__
  const isLocal = $page.url.host.includes('localhost')
  const timestamp = new Date(+env.version || 0).toISOString()
</script>

<Hover let:handlers let:hovering>
  <span use:hover={handlers} class="flex text-center font-mono font-thin leading-8 relative">
    <Tooltip show={hovering}>{timestamp}</Tooltip>
    v{appVersion}@{isLocal ? 'local' : env.version}
  </span>
</Hover>

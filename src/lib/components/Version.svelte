<script lang="ts">
  import * as env from '$app/environment'
  import { page } from '$app/state'
  import Tooltip from './Tooltip.svelte'
  const isLocal = $derived(page.url.host.includes('localhost'))
  const [semver, githash, timestamp] = env.version.split('_')
</script>

<span class="relative flex text-center font-mono font-thin leading-8">
  <Tooltip tooltip={timestamp} placement="top">
    v{semver}@{isLocal ? 'local' : githash}
  </Tooltip>
</span>

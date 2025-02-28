<script lang="ts">
  import * as env from '$app/environment'
  import { page } from '$app/state'
  import Button from './Button.svelte'
  import Tooltip from './Tooltip.svelte'
  const isLocal = $derived(page.url.host.includes('localhost'))
  const [semver, githash, timestamp] = env.version.split('_')
  const openRepo = () => {
    open(`https://github.com/gibsfinance/bridge-routing/commit/${githash}`, '_blank')
  }
</script>

<Button class="relative flex text-center font-mono font-thin leading-8" onclick={openRepo}>
  <Tooltip tooltip={timestamp} placement="top">
    v{semver}@{isLocal ? 'local' : githash.slice(0, 10)}
  </Tooltip>
</Button>

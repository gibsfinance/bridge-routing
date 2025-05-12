<script lang="ts">
  import { version } from '../config'
  import Button from './Button.svelte'
  import Tooltip from './Tooltip.svelte'
  const isLocal = $derived(window.location.hostname.includes('localhost'))
  const [semver, githash, timestamp] = version.split('_')
  const openRepo = () => {
    open(`https://github.com/gibsfinance/bridge-routing/commit/${githash}`, '_blank')
  }
</script>

<Button class="relative flex text-center font-mono font-thin leading-8" onclick={openRepo}>
  <Tooltip placement="top">
    {#snippet trigger()}
      v{semver}@{isLocal ? 'local' : githash.slice(0, 10)}
    {/snippet}
    {#snippet content()}
      {timestamp}
    {/snippet}
  </Tooltip>
</Button>

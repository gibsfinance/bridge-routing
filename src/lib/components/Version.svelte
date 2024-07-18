<script lang="ts">
  import * as env from '$app/environment'
  import { page } from '$app/stores'
  const appVersion = __APP_VERSION__
  const isLocal = $page.url.host.includes('localhost')
</script>

<span
  class="flex text-center font-mono font-thin tooltip tooltip-left"
  data-tip={new Date(+env.version || 0).toISOString()}>
  v{appVersion}@{isLocal ? 'local' : env.version}
</span>

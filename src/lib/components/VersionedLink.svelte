<script lang="ts">
  import { directDomain, domains } from '$lib/stores/window'
  import Icon from '@iconify/svelte'

  export let domain = 'bridge.pulsechain.com'
  export let path = ''
  let directUrl = ''
  $: domains.add(domain)
</script>

<span class="inline whitespace-pre">
  <a class="underline" target="_blank" href="https://{$directDomain.get(domain) || domain}{path}">{domain}</a><a
    href={directUrl + path}
    target="_blank"><Icon icon="gis:direct" class="inline mx-1" height="2em" width="2em" /></a>
</span>

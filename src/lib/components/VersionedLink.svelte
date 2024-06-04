<script lang="ts">
  import Icon from '@iconify/svelte'
  import { onMount } from 'svelte'

  export let domain = 'bridge.pulsechain.com'
  export let path = ''
  let directUrl = ''
  const getDirectUrl = () => {
    fetch(`https://${domain}/version.json`)
      .then((res) => res.json())
      .then((j) => {
        directUrl = j.ipfs_gateways[0]
      })
  }
  onMount(() => {
    getDirectUrl()
  })
</script>

<span class="inline whitespace-pre">
  <a class="underline" target="_blank" href="https://{domain}{path}">{domain}</a><a
    href={directUrl + path}
    target="_blank"><Icon icon="gis:direct" class="inline mx-1" height="2em" width="2em" /></a>
</span>

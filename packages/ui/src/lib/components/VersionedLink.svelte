<script lang="ts">
  import { domains, addDomain } from '../stores/window.svelte'
  import Icon from '@iconify/svelte'

  type Props = {
    domain: string
    path?: string
  }
  const { domain = '', path = '/' }: Props = $props()
  $effect(() => {
    addDomain(domain)
  })
  const d = $derived(domains.get(domain) || domain)
</script>

<span class="inline whitespace-pre">
  <a
    class="underline"
    aria-label="to indexed page for {domain}"
    target="_blank"
    href="https://{domain}{path}">{domain}</a>
  <a href="{d}{path}" aria-label="direct to ipfs page for {domain}" target="_blank">
    <Icon icon="gis:direct" class="inline mx-1" height="2em" width="2em" />
  </a>
</span>

<script lang="ts">
  import { type VisualChain } from '$lib/stores/auth/types'

  export let network!: VisualChain
  export let height = 32
  $: console.log(network)
</script>

<img class="network-icon min-w-8" style:height={`${height}px`} src={network.icon} alt={network.alt} />

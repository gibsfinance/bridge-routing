<script lang="ts">
  import BridgeExplainer from '$lib/components/BridgeExplainer.svelte'
  import OnboardExplainer from '$lib/components/OnboardExplainer.svelte'
  import Welcome from '$lib/components/Welcome.svelte'
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Gibs" />
</svelte:head>

<Welcome />
<OnboardExplainer />
<BridgeExplainer />

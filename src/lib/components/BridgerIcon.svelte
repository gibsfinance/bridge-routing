<script lang="ts">
  import tokensexProvider from '$lib/images/providers/tokensex.svg'
  import { chainsMetadata } from '$lib/stores/auth/constants'

  export let provider = 'pulsechain'

  type Setting = {
    src: string
    alt: string
  }

  const providerInfo = new Map<string, Setting>([
    [
      'tokensex',
      {
        src: tokensexProvider,
        alt: 'a golden spiral',
      },
    ],
    [
      'pulsechain',
      {
        src: chainsMetadata['0x171'].icon,
        alt: chainsMetadata['0x171'].alt,
      },
    ],
  ])
  $: settings = providerInfo.get(provider)!
</script>

<img height="28" width="28" src={settings.src} alt={settings.alt} />

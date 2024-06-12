<script lang="ts">
  import tokensexProvider from '$lib/images/providers/tokensex.svg'
  import { chainsMetadata } from '$lib/stores/auth/constants'

  export let provider = 'pulsechain'
  export let size = '28'

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

<img height={size} width={size} src={settings.src} alt={settings.alt} />

<script lang="ts">
  import tokensexProvider from '$lib/images/providers/tokensex.svg'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import Image from './Image.svelte'

  type Props = {
    provider?: string
    sizeClasses?: string
  }
  const { provider = 'pulsechain', sizeClasses = 'size-4' }: Props = $props()

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
  const settings = $derived(providerInfo.get(provider))
</script>

{#if settings}
  <Image {sizeClasses} src={settings.src} alt={settings.alt} />
{/if}

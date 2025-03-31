<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import Image from './Image.svelte'
  const tokensexProvider = new URL('/images/providers/tokensex.svg', import.meta.url).href

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
        src: chainsMetadata['0x171'].logoURI,
        alt: chainsMetadata['0x171'].alt,
      },
    ],
  ])
  const settings = $derived(providerInfo.get(provider))
</script>

{#if settings}
  <Image {sizeClasses} src={settings.src} alt={settings.alt} />
{/if}

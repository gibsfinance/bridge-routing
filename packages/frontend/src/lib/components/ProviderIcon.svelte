<script lang="ts">
  import type { ClassValue } from 'svelte/elements'

  import { chainsMetadata } from '@gibsfinance/bridge-sdk/chains'

  import Image from './Image.svelte'

  const tokensexProvider = 'images/providers/tokensex.svg'

  type Props = {
    provider?: string
    sizeClasses?: ClassValue
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

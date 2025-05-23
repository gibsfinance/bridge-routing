<script lang="ts">
  import { Popover } from '@skeletonlabs/skeleton-svelte'
  import Icon from '@iconify/svelte'

  import lifiLogo from '../../images/providers/lifi.svg?raw'
  import coinbaseLogo from '../../images/providers/coinbase.svg?raw'
  import relayLogo from '../../images/providers/relay.svg?raw'
  import zkp2pLogo from '../../images/providers/zkp2p.svg?raw'

  import { accountState, modal } from '../stores/auth/AuthProvider.svelte'
  import { onboardShowOnramp, onboardShowOnramps, type OnrampProviderKey } from '../stores/storage.svelte'

  import Button from './Button.svelte'
  import LifiWidget from './bridges/LifiWidget.svelte'
  import Image from './Image.svelte'

  const onrampsOpen = $derived.by(() => onboardShowOnramps.value)
  const coinbaseUrl = $derived.by(() => {
    const url = new URL('https://pay.coinbase.com/buy/select-asset')
    url.searchParams.set('appId', '00e61e2f-b25d-4dd0-8d6e-9b3bb91c9764')
    url.searchParams.set(
      'addresses',
      JSON.stringify({
        [accountState.address!]: ['ethereum'],
      }),
    )
    url.searchParams.set('assets', JSON.stringify(['ETH', 'USDC', 'USDT', 'DAI']))
    url.searchParams.set('defaultNetwork', 'ethereum')
    url.searchParams.set('defaultExperience', 'buy')
    url.searchParams.set('partnerUserId', accountState.address!)
    return url.toString()
  })
  type OnrampProvider = {
    key: OnrampProviderKey
    name: string
    logo?: string
    logoHref?: string
    onclick?: () => void
  }
  const zkP2PUrl = $derived(`https://zkp2p.xyz/swap?toToken=ETH${accountState.address ? `&recipientAddress=${accountState.address}` : ''}`)
  const relayUrl = $derived(`https://relay.link/onramp/ethereum${accountState.address ? `?toAddress=${accountState.address}` : ''}`)
  const providers = $derived([
    {
      key: 'others',
      name: 'Others',
      onclick: () => {
        modal.open({ view: 'OnRampProviders' })
        updateOnrampProviderStates(false, null)
      },
    },
    {
      key: 'coinbase',
      name: 'Coinbase',
      logo: coinbaseLogo,
      onclick: () => {
        if (accountState.address) {
          window.open(coinbaseUrl, 'coinbase-onramp', 'width=400,height=600')
          updateOnrampProviderStates(false, null)
        } else {
          modal.open({ view: 'Connect' })
        }
      },
    },
    {
      key: 'zkp2p',
      name: 'ZKP2P',
      logo: zkp2pLogo,
      onclick: () => {
        window.open(zkP2PUrl, '_blank')
        updateOnrampProviderStates(false, null)
      },
    },
    {
      key: 'relay',
      name: 'Relay',
      logo: relayLogo,
      onclick: () => {
        window.open(relayUrl, 'relay-onramp', 'width=400,height=678')
        updateOnrampProviderStates(false, null)
      },
    },
    {
      key: 'lifi',
      name: 'LI.FI',
      logo: lifiLogo,
    },
  ] as OnrampProvider[])
  const reversedProviders = $derived([...providers].reverse())
  const updateOnrampProviderStates = (open: boolean, key?: OnrampProviderKey) => {
    onboardShowOnramps.value = open
    if (key !== undefined) {
      onboardShowOnramp.value = key
    }
  }
  const openProvider = $derived((key: OnrampProviderKey) => () => {
    updateOnrampProviderStates(false, key)
  })
</script>

<Popover
  open={onrampsOpen}
  onOpenChange={(e) => updateOnrampProviderStates(e.open)}
  positioning={{ placement: 'bottom-end', gutter: -4, shift: 4 }}
  triggerBase="flex flex-col items-center justify-items-end grow gap-1 rounded-2xl shadow-inset justify-between w-full text-surface-contrast-50 border transition-all duration-100 preset-outline-surface-500 relative shadow bg-white px-4 py-1 group"
  contentBase="card bg-white space-y-4 max-w-[320px] shadow-lg border border-gray-200 py-1"
  modal
>
  {#snippet trigger()}
    <div class="text-gray-500 text-sm w-full text-left flex flex-row gap-1 items-center">
      <span class="text-gray-500 text-sm w-full text-left flex flex-row justify-between">
        <span>Onramps to Ethereum</span>
        <span class="flex flex-row-reverse">
          {#each reversedProviders as provider}
          {#if provider.key !== 'others'}
          <div class="size-6 -ml-3 bg-gray-50 border border-gray-200 rounded-full group-hover:-ml-1 transition-all overflow-hidden [&>*]:size-full transition-duration-100">
            {#if provider.logoHref}
              <Image src={provider.logoHref} />
            {:else}
              {@html provider.logo}
            {/if}
          </div>
          {/if}
          {/each}
        </span>
      </span>
      <Icon
        icon="mdi:bank"
        mode="svg"
        class="size-7 p-1 text-white [&>path]:text-black flex transition-all duration-100 {onrampsOpen
          ? 'rotate-180'
          : ''}" />
    </div>
  {/snippet}
  {#snippet content()}
  <div class="flex flex-col gap-1 grow w-56">
    <ul
      class="flex flex-col items-center overflow-hidden transition-all duration-200" tabindex="-1">
      {#each reversedProviders as provider}
      <li class="hover:bg-surface-50 overflow-hidden flex px-2 py-0.5 w-full">
        <Button
          tabindex={-1}
          onclick={provider.onclick ?? openProvider(provider.key)}
          class="flex flex-row items-center text-surface-contrast-50 justify-between w-full">
          <span class="h-full flex leading-8 text-base">{provider.name}</span>
          <span
            class="size-8 items-center flex justify-center overflow-hidden scale-90 [&>svg]:w-8 translate-x-[1px]" class:rounded-full={provider.key === 'coinbase'}>
            {#if provider.logoHref}
              <Image src={provider.logoHref} />
            {:else}
              {@html provider.logo}
            {/if}
          </span>
        </Button>
      </li>
      {/each}
    </ul>
  </div>
  {/snippet}
</Popover>

{#if onboardShowOnramp.value === 'lifi'}
  <LifiWidget close={() => updateOnrampProviderStates(false, null)} />
{/if}

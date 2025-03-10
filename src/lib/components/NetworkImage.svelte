<script lang="ts">
  import { Chains, toChain } from '$lib/stores/auth/types'
  import Icon from '@iconify/svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { accountState, switchNetwork } from '$lib/stores/auth/AuthProvider.svelte'
  import { bridgeKey, toPath, chainIdToChain } from '$lib/stores/input.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import _ from 'lodash'
  import { validBridgeKeys, isProd } from '$lib/stores/config.svelte'
  import { zeroAddress } from 'viem'

  const walletAccount = $derived(accountState.address)
  const provider = $derived(page.params.provider)

  let dropdown: HTMLDetailsElement | null = $state(null)
  type Props = {
    network: number
    sizeClasses: string
    inChain?: boolean
  }
  const { network: providedNetwork, sizeClasses, inChain }: Props = $props()
  const network = $derived(chainIdToChain(toChain(providedNetwork)))
  const bridgeKeyIndex = $derived((2 - Number(inChain)) as 2 | 1)
  const availableBridgeKeys = $derived(validBridgeKeys(isProd.value))
  const networkOptions = $derived.by(() =>
    inChain
      ? availableBridgeKeys
      : availableBridgeKeys.filter(
          (vbk) => vbk[0] === bridgeKey.value[0] && vbk[1] === bridgeKey.value[1],
        ),
  )
  const reorderedBridgeKeys = $derived.by(() =>
    [bridgeKey.partner].concat(
      networkOptions
        .slice(0)
        .filter((vbk) => !_.isEqual(vbk, bridgeKey) && !_.isEqual(vbk, bridgeKey.partner))
        .concat([bridgeKey.value]),
    ),
  )
</script>

{#if inChain}
  <details class="dropdown relative flex grow justify-center" bind:this={dropdown}>
    <summary class="flex select-none flex-row items-center justify-items-center space-x-2">
      <StaticNetworkImage network={providedNetwork} {sizeClasses} {provider} />
      <span class="ml-1 whitespace-pre leading-8">{network.name}</span>
      <Icon icon="mingcute:down-fill" class="flex size-5" />
    </summary>
    <ul
      class="dropdown-content absolute left-0 top-0 z-1 -mx-2 -mt-1 w-60 bg-slate-50 px-0 pb-1 pt-0 shadow-sm">
      {#each reorderedBridgeKeys as listBridgeKey}
        <li class="flex flex-row items-center hover:bg-slate-200">
          <button
            class="flex h-10 grow flex-row items-center px-2"
            onclick={async () => {
              if (dropdown) dropdown.open = false
              const tokenAddressIn =
                listBridgeKey === bridgeKey.partner
                  ? bridgeSettings.assetOut.value?.address
                  : zeroAddress
              if (walletAccount) switchNetwork(chainIdToChain(bridgeKey.toChain))
              await goto(`#/delivery/${toPath(listBridgeKey)}/${tokenAddressIn}`)
              return
            }}>
            <StaticNetworkImage
              network={Number(listBridgeKey[bridgeKeyIndex])}
              provider={listBridgeKey[0]}
              {sizeClasses} />
            <span class="flex grow px-2"
              >{chainsMetadata[listBridgeKey[bridgeKeyIndex]].name}</span>
          </button>
        </li>
      {/each}
    </ul>
  </details>
{:else}
  <div class="flex flex-row items-center justify-items-center space-x-2">
    <StaticNetworkImage network={providedNetwork} {sizeClasses} />
    <span class="leading-8">{network.name}</span>
  </div>
{/if}

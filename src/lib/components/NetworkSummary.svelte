<!-- <script lang="ts">
  import { humanReadableNumber } from '$lib/stores/utils'
  import { Chains, toChain } from '$lib/stores/auth/types'
  import NetworkImage from './NetworkImage.svelte'
  import * as utils from '$lib/utils.svelte'
  import type { Token } from '$lib/types.svelte'
  import Tooltip from './Tooltip.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import { chainIdToChain } from '$lib/stores/input.svelte'
  type Props = {
    balance: bigint | null
    asset: Token | null
    network: Chains
    unwrap?: boolean
    inChain: boolean
    onmax?: () => void
  }
  const { balance, asset, network: providedNetwork, unwrap, inChain, onmax }: Props = $props()
  const network = $derived(chainIdToChain(providedNetwork))
  const showMax = $derived(!!onmax)
  const disableMax = $derived(balance === 0n)
  const maxOutBalance = () => {
    if (disableMax) return
    onmax?.()
  }
  const nameTooltip = $derived(utils.nativeName(asset, unwrap))
</script>

<div class="flex flex-row justify-between">
  <div class="flex flex-row">
    <NetworkImage network={providedNetwork} {inChain} sizeClasses="size-8" />
  </div>
  <div class="flex flex-col justify-around">
    <div class="flex flex-row">
      <div
        class="relative flex items-baseline self-end text-xs leading-6"
        class:mx-2={showMax}
        class:ml-2={!showMax}>
        <Tooltip tooltip={nameTooltip} placement="left">
          <span
            class="max-w-[175px] overflow-hidden text-ellipsis"
            class:opacity-60={!loading.isResolved(`balance-${toChain(network.id)}`)}
            >{balance === null
              ? ''
              : humanReadableNumber(balance, { decimals: asset?.decimals ?? 18 })}</span
          >{utils.nativeSymbol(asset, unwrap)}
        </Tooltip>
      </div>
      {#if showMax}
        <div class="text-white flex">
          <button
            class="rounded-md px-2 text-xs uppercase leading-6 h-6 flex"
            class:bg-tertiary-400={disableMax}
            class:bg-tertiary-600={!disableMax}
            class:hover:bg-tertiary-500={!disableMax}
            onclick={maxOutBalance}>
            max
          </button>
        </div>
      {/if}
    </div>
  </div>
</div> -->

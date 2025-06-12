<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Token } from '@gibsfinance/bridge-sdk/types'
  import { zeroAddress } from 'viem'

  import { assetSources } from '../stores/bridge-settings.svelte'
  import { bridgableTokens } from '../stores/input.svelte'
  import { ellipsis } from '../stores/utils'

  import TokenIcon from './TokenIcon.svelte'
  type Props = {
    token: Token
    truncate?: number
    reversed?: boolean
    externalGroup?: boolean
    wrapperSizeClasses?: ClassValue
    nameClasses?: ClassValue
    wrapperPadding?: ClassValue
  }
  const {
    token,
    truncate = 20,
    reversed = false,
    externalGroup = false,
    wrapperSizeClasses = 'w-full h-full',
    wrapperPadding = 'px-6',
    nameClasses: nameClassesInput,
  }: Props = $props()
  const wrapperClasses = $derived([
    'flex gap-2',
    wrapperSizeClasses,
    wrapperPadding,
    reversed ? 'flex-row-reverse' : 'flex-row',
  ])
  const nameClasses = $derived([
    'leading-5 transition-all transition-duration-100 text-base',
    nameClassesInput,
  ])
  const textContainerClasses = $derived([
    'flex mx-1 grow flex-col leading-8 relative min-w-0 overflow-hidden',
    reversed ? 'text-right' : 'text-left',
    externalGroup ? null : 'group',
  ])
  const addressClasses = $derived([
    'text-gray-400 font-mono text-xs leading-4 transition-all transition-duration-100 -bottom-0.5',
    reversed ? 'right-0' : 'left-0',
  ])
  const src = $derived(token.logoURI || assetSources(token, bridgableTokens.value))
</script>

<div class={wrapperClasses}>
  <span class="size-10 flex-shrink-0" data-src={src}>
    <TokenIcon src={src} sizeClasses="size-10" />
  </span>
  <span class={textContainerClasses}>
    <span class={`${nameClasses} leading-6 truncate overflow-hidden text-ellipsis`}
      >{token.name}</span>
    <span class="flex flex-row text-sm items-center leading-4 gap-2">
      <span class="text-gray-500 font-light">{token.symbol}</span>
      {#if token.address !== zeroAddress}
        <span class={addressClasses} title={token.address}>
          {ellipsis(token.address, { length: truncate, prefixLength: 2 })}
        </span>
      {/if}
    </span>
  </span>
</div>

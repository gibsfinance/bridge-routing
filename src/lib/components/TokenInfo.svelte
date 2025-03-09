<script lang="ts">
  import TokenIcon from './TokenIcon.svelte'
  import type { Token } from '$lib/types.svelte'
  import { assetSources } from '$lib/stores/bridge-settings.svelte'
  import { ellipsis } from '$lib/stores/utils'
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  type Props = {
    token: Token
    truncate?: number
    reversed?: boolean
    externalGroup?: boolean
    wrapperSizeClasses?: ClassParam
    nameClasses?: ClassParam
    wrapperPadding?: ClassParam
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
  const wrapperClasses = $derived(
    classNames(
      'flex gap-2',
      wrapperSizeClasses,
      wrapperPadding,
      reversed ? 'flex-row-reverse' : 'flex-row',
    ),
  )
  const nameClasses = $derived(
    classNames('leading-5 transition-all transition-duration-100 text-base', nameClassesInput),
  )
  const textContainerClasses = $derived(
    classNames(
      'flex mx-1 grow flex-col leading-8 relative min-w-0 overflow-hidden',
      reversed ? 'text-right' : 'text-left',
      externalGroup ? null : 'group',
    ),
  )
  const addressClasses = $derived(
    classNames(
      'text-gray-400 font-mono text-xs leading-4 transition-all transition-duration-100 -bottom-0.5',
      reversed ? 'right-0' : 'left-0',
    ),
  )
</script>

<div class={wrapperClasses}>
  <span class="size-10 flex-shrink-0">
    <TokenIcon src={token.logoURI || assetSources(token)} sizeClasses="size-10" />
  </span>
  <span class={textContainerClasses}>
    <span class={`${nameClasses} leading-6 truncate overflow-hidden text-ellipsis`}
      >{token.name}</span>
    <span class="flex flex-row text-sm items-center leading-4 gap-2">
      <span class="text-gray-500 font-light">{token.symbol}</span>
      <span class={addressClasses}>
        {ellipsis(token.address, { length: truncate, prefixLength: 2 })}
      </span>
    </span>
  </span>
</div>

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
    wrapperSizeClasses?: string
    nameClasses?: ClassParam
  }
  const {
    token,
    truncate = 20,
    reversed = false,
    externalGroup = false,
    wrapperSizeClasses = 'w-full h-full',
    nameClasses: nameClassesInput,
  }: Props = $props()
  const wrapperClasses = $derived(
    classNames('flex', wrapperSizeClasses, reversed ? 'flex-row-reverse' : 'flex-row'),
  )
  const nameClasses = $derived(
    classNames(
      'leading-5 translate-y-1.5 group-hover:translate-y-0.5 transition-all transition-duration-100',
      nameClassesInput,
    ),
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
      'text-slate-500 font-mono text-xs opacity-0 group-hover:opacity-100 transition-all transition-duration-100 absolute -bottom-0.5',
      reversed ? 'right-0' : 'left-0',
    ),
  )
</script>

<div class={wrapperClasses}>
  <span class="size-8 flex-shrink-0">
    <TokenIcon src={token.logoURI || assetSources(token)} />
  </span>
  <span class={textContainerClasses}>
    <span class={`${nameClasses} truncate overflow-hidden text-ellipsis`}>{token.name}</span>
    <span class={addressClasses}>
      {ellipsis(token.address, { length: truncate, prefixLength: 2 })}
    </span>
  </span>
</div>

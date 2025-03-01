<script lang="ts">
  import TokenIcon from './TokenIcon.svelte'
  import type { Token } from '$lib/types.svelte'
  import { assetSources } from '$lib/stores/bridge-settings.svelte'
  import { ellipsis } from '$lib/stores/utils'
  import classNames from 'classnames'
  type Props = {
    token: Token
    truncate?: number
    reversed?: boolean
    externalGroup?: boolean
    wrapperSizeClasses?: string
  }
  const { token, truncate = 20, reversed = false, externalGroup = false, wrapperSizeClasses = 'w-full h-full' }: Props = $props()
  const wrapperClasses = $derived(
    classNames('flex', wrapperSizeClasses, reversed ? 'flex-row-reverse' : 'flex-row'),
  )
  const textContainerClasses = $derived(
    classNames(
      'w-full h-full text-left flex mx-1 flex-col leading-8 text-ellipsis whitespace-pre relative',
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
  <span class="size-8">
    <!-- might be a good idea to simply keep it loaded after first -->
    <TokenIcon src={assetSources(token)} />
  </span>
  <span class={textContainerClasses}>
    <span
      class="leading-5 translate-y-1.5 group-hover:translate-y-0.5 transition-all transition-duration-100"
      >{token.name}</span>
    <span class={addressClasses}>
      {ellipsis(token.address, { length: truncate, prefixLength: 2 })}
    </span>
  </span>
</div>

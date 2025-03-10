<script lang="ts">
  import { humanReadableNumber } from '$lib/stores/utils'
  import type { ClassParam, Token } from '$lib/types.svelte'
  // import Tooltip from './Tooltip.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import { toChain } from '$lib/stores/auth/types'
  import {
    latestBlock,
    tokenBalanceLoadingKey,
    TokenBalanceWatcher,
  } from '$lib/stores/chain-events.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import classNames from 'classnames'
  import Loading from './Loading.svelte'
  import { oneEther } from '$lib/stores/bridge-settings.svelte'
  import { untrack } from 'svelte'

  type Props = {
    token: Token
    onmax?: (balance: bigint) => boolean | void
    onbalanceupdate?: (balance: bigint | null) => void
    roundedClasses?: ClassParam
    decimalClasses?: ClassParam
    wrapperClasses?: ClassParam
    wrapperSizeClasses?: ClassParam
    hideSymbol?: boolean
    decimalLimit?: number
    showLoader?: boolean
  }
  const {
    token,
    wrapperSizeClasses = '',
    wrapperClasses: wrapperClassNames = 'relative flex items-center text-xs leading-5 gap-1',
    showLoader = false,
    roundedClasses = 'rounded-md',
    decimalClasses = '',
    onmax,
    onbalanceupdate,
  }: Props = $props()
  const showMax = $state(!!onmax)
  const tokenBalance = $derived(token && new TokenBalanceWatcher())

  $effect(() => untrack(() => latestBlock.watch(token.chainId)))
  $effect(() => {
    const block = untrack(() => latestBlock.block(token.chainId))
    if (!accountState.address || !block) {
      return
    }
    return tokenBalance.fetch(token.chainId, token, accountState.address, block)
  })

  $effect(() => {
    onbalanceupdate?.(tokenBalance.value)
  })
  const balance = $derived(tokenBalance.value ?? 0n)
  const disableMax = $derived(balance === 0n)
  const loadingKey = $derived(
    tokenBalanceLoadingKey(token.chainId, token, accountState.address ?? '0x'),
  )
  const decimalClassNames = $derived(classNames('h-full', decimalClasses))
  const maxOutBalance = (event: MouseEvent) => {
    if (disableMax) return
    const shouldStopProp = onmax?.(balance)
    if (shouldStopProp) {
      event.stopPropagation()
    }
  }
  const wrapperClasses = $derived(classNames(wrapperClassNames, wrapperSizeClasses))
  const humanReadableText = $derived(
    humanReadableNumber(balance, {
      decimals: token?.decimals ?? 18,
      maxDecimals: 18 - Math.floor(Number(balance / oneEther / 3n)).toString().length,
    }),
  )
</script>

<div class={wrapperClasses}>
  <span class="flex flex-row gap-1 items-center text-gray-500 leading-5 text-[14px]">
    {#if showLoader && tokenBalance.value === null}
      <Loading key={loadingKey} class="w-4 h-5" />
    {/if}
    <span class={decimalClassNames} class:opacity-70={!loading.isResolved(loadingKey)}
      >{tokenBalance.value === null ? '' : humanReadableText}
    </span>
    <span class="flex">{token.symbol}</span>
  </span>
  {#if showMax}
    <button
      class:bg-tertiary-400={disableMax}
      class:bg-tertiary-600={!disableMax}
      class:hover:bg-tertiary-500={!disableMax}
      class:text-tertiary-contrast-950={disableMax}
      class="{roundedClasses} rounded-full text-xs flex items-center justify-center text-surface-contrast-600 px-1.5"
      onclick={maxOutBalance}>
      Max
    </button>
  {/if}
</div>

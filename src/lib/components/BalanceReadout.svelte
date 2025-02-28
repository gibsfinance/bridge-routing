<script lang="ts">
  import { humanReadableNumber } from '$lib/stores/utils'
  import type { ClassParam, Token } from '$lib/types.svelte'
  import Tooltip from './Tooltip.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import { toChain } from '$lib/stores/auth/types'
  import { chainIdToChain } from '$lib/stores/input.svelte'
  import {
    ChainState,
    tokenBalanceLoadingKey,
    TokenBalanceWatcher,
  } from '$lib/stores/chain-events.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import classNames from 'classnames'

  type Props = {
    token: Token
    onmax?: (balance: bigint) => boolean | void
    roundedClasses?: ClassParam
    decimalClasses?: ClassParam
    wrapperClasses?: ClassParam
    wrapperSizeClasses?: ClassParam
    hideSymbol?: boolean
    decimalLimit?: number
  }
  const {
    token,
    onmax,
    wrapperSizeClasses = '',
    wrapperClasses:
      wrapperClassNames = 'relative flex items-baseline text-xs leading-6 pointer-events-auto',
    roundedClasses = 'rounded-md',
    decimalClasses = '',
    hideSymbol = false,
    decimalLimit = token.decimals,
  }: Props = $props()
  const showMax = $state(!!onmax)
  const chain = $derived(toChain(token.chainId))
  const network = $derived(chainIdToChain(chain))
  const tokenBalance = new TokenBalanceWatcher()
  const walletAccount = $derived(accountState.address)
  const chainState = new ChainState()
  $effect(() => {
    return chainState.watch(chain)
  })
  $effect(() => {
    if (!walletAccount || !chainState.block) return
    return tokenBalance.fetch(chain, token, walletAccount, chainState.block)
  })
  const balance = $derived(tokenBalance.value ?? 0n)
  const disableMax = $derived(balance === 0n)
  const loadingKey = $derived(tokenBalanceLoadingKey(chain, token, walletAccount ?? '0x'))
  const decimalClassNames = $derived(classNames(decimalClasses))
  const maxOutBalance = (event: MouseEvent) => {
    if (disableMax) return
    const shouldStopProp = onmax?.(balance)
    if (shouldStopProp) {
      event.stopPropagation()
    }
  }
  const wrapperClasses = $derived(classNames(wrapperClassNames, wrapperSizeClasses))
</script>

<div class={wrapperClasses}>
  <Tooltip tooltip={token.name} placement="top">
    <span class="flex flex-row gap-1 text-gray-500">
      <span class={decimalClassNames} class:opacity-60={!loading.isResolved(loadingKey)}
        >{balance === null
          ? ''
          : humanReadableNumber(balance, {
              decimals: token?.decimals ?? 18,
              maxDecimals: decimalLimit,
            })}
      </span>
      {#if !hideSymbol}
        <span class="flex">{token.symbol}</span>
      {/if}
    </span>
  </Tooltip>
</div>
{#if showMax}
  <button
    class="{roundedClasses} px-2 text-xs uppercase leading-6 h-6 flex"
    class:bg-tertiary-400={disableMax}
    class:bg-tertiary-600={!disableMax}
    class:hover:bg-tertiary-500={!disableMax}
    onclick={maxOutBalance}>
    max
  </button>
{/if}

<script lang="ts">
  import { humanReadableNumber } from '$lib/stores/utils'
  import type { ClassParam, Token } from '$lib/types.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import {
    latestBlock,
    tokenBalanceLoadingKey,
    TokenBalanceWatcher,
    blocks,
  } from '$lib/stores/chain-events.svelte'
  import classNames from 'classnames'
  import Loading from './Loading.svelte'
  import { oneEther } from '$lib/stores/bridge-settings.svelte'
  import type { Hex } from 'viem'

  type Props = {
    token: Token | null
    account?: string | null | undefined
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
    account,
    wrapperSizeClasses = '',
    wrapperClasses: wrapperClassNames = 'relative flex items-center text-xs leading-5 gap-1',
    showLoader = false,
    roundedClasses = 'rounded-md',
    decimalClasses = '',
    onmax,
    onbalanceupdate,
  }: Props = $props()
  const tokenBalance = new TokenBalanceWatcher()
  const showMax = $state(!!onmax)
  const chainId = $derived(token?.chainId ?? 0)

  $effect(() => {
    if (chainId) {
      return latestBlock(chainId)
    }
  })
  const block = $derived(blocks.get(chainId))
  $effect.pre(() => {
    // console.log('fetching balance', { chainId, token, account, block })
    return tokenBalance.fetch({
      chainId,
      token: token,
      account: account as Hex,
      block,
    })
  })

  $effect(() => {
    if (!tokenBalance) return
    onbalanceupdate?.(tokenBalance.value)
  })
  const balance = $derived(tokenBalance?.value ?? 0n)
  const disableMax = $derived(balance === 0n)
  const loadingKey = $derived(
    token && tokenBalanceLoadingKey(token?.chainId ?? 0, token.address, (account as Hex) ?? '0x'),
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
  // $inspect(
  //   tokenBalance?.value,
  //   token?.chainId ?? 0,
  //   token?.address,
  //   account as Hex,
  //   humanReadableText,
  // )
</script>

<div class={wrapperClasses}>
  <span class="flex flex-row gap-1 items-center text-gray-500 leading-5 text-[14px]">
    {#if showLoader && tokenBalance?.value === null}
      <Loading key={loadingKey} class="w-4 h-5" />
    {/if}
    <span class={decimalClassNames} class:opacity-75={!loading.isResolved(loadingKey)}
      >{tokenBalance?.value === null ? '' : humanReadableText}
    </span>
    <span class="flex">{token?.symbol}</span>
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

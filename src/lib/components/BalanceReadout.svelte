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
  import { untrack } from 'svelte'
  import {
    createFontScaler,
    // largeInputFontScaler,
  } from '$lib/stores/font-scaler'
  import { oneEther } from '$lib/stores/bridge-settings.svelte'

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
    onmax,
    wrapperSizeClasses = '',
    wrapperClasses:
      wrapperClassNames = 'relative flex items-baseline text-xs leading-6 pointer-events-auto',
    showLoader = false,
    roundedClasses = 'rounded-md',
    decimalClasses = '',
    hideSymbol = false,
    onbalanceupdate,
  }: Props = $props()
  const showMax = $state(!!onmax)
  const chain = $derived(toChain(token.chainId))
  const tokenBalance = new TokenBalanceWatcher()
  const walletAccount = $derived(untrack(() => accountState.address))
  $effect(() => untrack(() => latestBlock.watch(Number(chain))))
  $effect(() => {
    const block = latestBlock.block(Number(chain))
    if (!walletAccount || !block) {
      return
    }
    return tokenBalance.fetch(Number(chain), token, walletAccount, block)
  })
  $effect(() => {
    onbalanceupdate?.(tokenBalance.value)
  })
  const balance = $derived(tokenBalance.value ?? 0n)
  const disableMax = $derived(balance === 0n)
  const loadingKey = $derived(tokenBalanceLoadingKey(Number(chain), token, walletAccount ?? '0x'))
  const decimalClassNames = $derived(classNames('h-full', decimalClasses))
  const maxOutBalance = (event: MouseEvent) => {
    if (disableMax) return
    const shouldStopProp = onmax?.(balance)
    if (shouldStopProp) {
      event.stopPropagation()
    }
  }
  const wrapperClasses = $derived(classNames(wrapperClassNames, wrapperSizeClasses))
  // const balanceFontScaler = createFontScaler({
  //   maxFontSize: 14,
  //   minFontSize: 12,
  //   freeCharacters: 18,
  //   scale: 2,
  // })
  const humanReadableText = $derived(
    humanReadableNumber(balance, {
      decimals: token?.decimals ?? 18,
      maxDecimals: 18 - Math.floor(Number(balance / oneEther / 3n)).toString().length,
    }),
  )
  $inspect(humanReadableText, balance, Number(balance / oneEther / 3n))
  // const fontSize = $derived(balanceFontScaler(humanReadableText.length))
</script>

<div class={wrapperClasses}>
  <!-- <Tooltip tooltip={token.name} placement="left"> -->
  <span class="flex flex-row gap-1 items-center text-gray-700 leading-5 text-sm">
    {#if showLoader && tokenBalance.value === null}
      <Loading key={loadingKey} class="w-4 h-5" />
    {/if}
    <span class={decimalClassNames} class:opacity-70={!loading.isResolved(loadingKey)}
      >{tokenBalance.value === null ? '' : humanReadableText}
    </span>
    <!-- {#if !hideSymbol} -->
    <span class="flex">{token.symbol}</span>
    <!-- {/if} -->
  </span>
  <!-- </Tooltip> -->
</div>
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

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { formatUnits, parseUnits } from 'viem'
  import NetworkSummary from './NetworkSummary.svelte'
  import { humanReadableNumber, type Asset } from '$lib/stores/utils'
  import {
    bridgeFrom,
    limit,
    loadFeeFor,
    incentiveFee,
    estimatedGas,
    latestBaseFeePerGas,
    amountAfterBridgeFee,
    gasBasedFee,
    fixedFee,
    estimatedCost,
  } from '$lib/stores/bridge-settings'
  import { type VisualChain } from '$lib/stores/auth/types'
  import { createPublicClient, http } from 'viem'
  import SmallInput from './SmallInput.svelte'
  export let network!: VisualChain
  export let originationNetwork!: VisualChain
  const dispatch = createEventDispatcher()
  const showToolbox = (type: string) => {
    dispatch('toggle', type)
  }
  const publicClient = createPublicClient({
    chain: network,
    transport: http(),
  })
  export let asset!: Asset
  onMount(() => {
    return publicClient.watchBlocks({
      emitOnBegin: true,
      onBlock: (block) => {
        latestBaseFeePerGas.set(block.baseFeePerGas as bigint)
      },
    })
  })
  $: loadFeeFor(true, originationNetwork.id, network.id)
  estimatedGas.set(270_000n)
  $: deliveredAmount = $amountAfterBridgeFee - $estimatedCost
  const limitUpdated = (lim: string) => {
    limit.set(parseUnits(lim, 18))
  }
  const incentiveFeeUpdated = (incFee: string) => {
    incentiveFee.set(parseUnits(incFee, 18) / 100n)
  }
  const defaultIncFee = '10'
  incentiveFeeUpdated(defaultIncFee)
  let defaultLimit = '0.01'
  let costLimitLocked = false
  $: {
    if (!costLimitLocked && !$fixedFee) {
      // let it float as the base fee per gas is updated
      const lowResLimit = $latestBaseFeePerGas / (10n ** 9n * 8n)
      defaultLimit = formatUnits(lowResLimit * 10n ** 16n, asset.decimals)
      limitUpdated(defaultLimit)
    }
  }
  limitUpdated(defaultLimit)
  let balance = 0n
  const focusOnInputChild = (e: any) => {
    e.currentTarget.querySelector('input')?.focus()
  }
</script>

<div class="bg-slate-100 py-2 px-3 rounded-t-lg">
  <NetworkSummary {network} {asset} {balance} />
</div>
<div class="bg-slate-100 mt-[1px] py-1">
  <div class="flex flex-row px-4 leading-8 justify-between">
    <span>Bridge Fee</span>
    <span class="cursor-not-allowed tooltip" data-tip="Fee set on the bridge"
      >{humanReadableNumber($bridgeFrom[originationNetwork.id][network.id].feeH2F * 100n)}%</span
    >
  </div>
</div>
<div class="bg-slate-100 mt-[1px] py-1">
  <div class="flex flex-row px-4 leading-8 justify-between">
    <span class="leading-8 flex flex-row align-middle"
      ><span>Fixed</span>
      <input
        type="checkbox"
        class="toggle toggle-sm [--tglbg:white] border-purple-600 bg-purple-600 hover:bg-purple-400 disabled:bg-purple-600 disabled:opacity-100 mx-1 my-1.5"
        checked={$gasBasedFee}
        on:change={() => {
          fixedFee.update(($ff) => !$ff)
        }}
      />
      <span>Base Fee</span>
    </span>
    <button
      class="tooltip flex flex-row strike"
      data-tip="Percentage of gas * base fee to allocate to the transaction runner for performing this action"
      class:line-through={!$gasBasedFee}
      on:click={focusOnInputChild}
      >⛽ +<SmallInput
        value={defaultIncFee}
        validate={(v) => parseUnits(v, 18)}
        on:update={(e) => incentiveFeeUpdated(e.detail.value)}
      />%</button
    >
  </div>
</div>
<div class="bg-slate-100 mt-[1px] py-1">
  <div class="flex flex-row px-4 leading-8 justify-between tooltip">
    <button
      on:click={() => {
        costLimitLocked = !costLimitLocked
      }}
      >Cost Limit&nbsp;{#if costLimitLocked || $fixedFee}🔒{:else}🔓{/if}</button
    >
    <button
      class="tooltip flex flex-row"
      data-tip="The max you are willing to tip to the address delivering native eth"
      on:click={focusOnInputChild}
      >&lt;= <SmallInput
        value={defaultLimit}
        validate={(v) => parseUnits(v, 18)}
        on:update={(e) => {
          if (e.detail.fromInput) costLimitLocked = true
          limitUpdated(e.detail.value)
        }}
      /> ETH</button
    >
  </div>
</div>
<div class="rounded-b-lg bg-slate-100 mt-[1px] py-1">
  <div class="flex flex-row px-4 leading-8 justify-between">
    <div class="flex flex-row">
      <button class="flex mr-2" on:click={() => showToolbox('settings')}>⚙️</button>
      <button class="flex mr-2" on:click={() => showToolbox('details')}>📐</button>
    </div>
    <span class="tooltip text-xl" data-tip="Estimated tokens to be delivered"
      >{#if !$fixedFee}~
      {/if}{humanReadableNumber(deliveredAmount > 0n ? deliveredAmount : 0n)}
      {asset.symbol}</span
    >
  </div>
</div>

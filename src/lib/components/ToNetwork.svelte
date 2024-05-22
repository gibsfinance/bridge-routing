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
  import Warning from './Warning.svelte'
  export let originationNetwork!: VisualChain
  export let destinationNetwork!: VisualChain
  const dispatch = createEventDispatcher()
  const showToolbox = (type: string) => {
    dispatch('toggle', type)
  }
  const publicClient = createPublicClient({
    chain: destinationNetwork,
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
  $: loadFeeFor(originationNetwork.id, destinationNetwork.id)
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
      const lowResLimit = $latestBaseFeePerGas / (10n ** 8n * 8n)
      let lim = lowResLimit * 10n ** 16n
      if (lim > $amountAfterBridgeFee) {
        lim = $amountAfterBridgeFee
      }
      const proposedDefaultLimit = formatUnits(lim, asset.decimals)
      if (proposedDefaultLimit !== defaultLimit) {
        defaultLimit = proposedDefaultLimit
        console.log('limit updated %o', defaultLimit)
        limitUpdated(defaultLimit)
      }
    }
  }
  limitUpdated(defaultLimit)
  let balance = 0n
  const focusOnInputChild = (e: any) => {
    e.currentTarget.querySelector('input')?.focus()
  }
  const toggleFixedFee = () => {
    fixedFee.update(($ff) => !$ff)
  }
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg">
    <NetworkSummary network={destinationNetwork} {asset} {balance} />
  </div>
  <div class="bg-slate-100 mt-[1px] py-1">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <span>Bridge Fee</span>
      <span class="cursor-not-allowed tooltip" data-tip="Fee set on the bridge">
        {humanReadableNumber(
          $bridgeFrom[originationNetwork.id][destinationNetwork.id].feeH2F * 100n,
        )}%
      </span>
    </div>
  </div>
  <div class="bg-slate-100 mt-[1px] py-1">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <span class="leading-8 flex flex-row align-middle">
        <button class="pr-1" on:click={toggleFixedFee}>Fixed</button>
        <input
          type="checkbox"
          class="toggle toggle-sm [--tglbg:white] border-purple-600 bg-purple-600 hover:bg-purple-400 disabled:bg-purple-600 disabled:opacity-100 my-1.5"
          checked={$gasBasedFee}
          on:change={toggleFixedFee} />
        <button class="px-1" on:click={toggleFixedFee}>Base</button>
      </span>
      <button
        class="flex flex-row strike tooltip"
        data-tip={$fixedFee
          ? 'Fee uses fixed value defined in cost limit'
          : 'Percentage of gas * base fee to allocate to the transaction runner for performing this action'}
        class:line-through={!$gasBasedFee}
        on:click={focusOnInputChild}>
        ⛽ +<SmallInput
          value={defaultIncFee}
          validate={(v) => parseUnits(v, 18)}
          on:update={(e) => incentiveFeeUpdated(e.detail.value)} />%</button>
    </div>
  </div>
  <div class="bg-slate-100 mt-[1px] py-1 relative">
    <div class="flex flex-row px-3 leading-8 justify-between tooltip">
      <button
        on:click={() => {
          costLimitLocked = !costLimitLocked
        }}>
        Cost Limit&nbsp;{#if costLimitLocked || $fixedFee}🔒{:else}🔓{/if}</button>
      <button
        class="tooltip flex flex-row"
        data-tip={$fixedFee
          ? 'The fixed fee to tip if the validator does the work'
          : 'The max you are willing to tip to the address delivering native eth'}
        on:click={focusOnInputChild}>
        &lt;= <SmallInput
          value={defaultLimit}
          validate={(v) => parseUnits(v, 18)}
          on:update={(e) => {
            if (e.detail.fromInput) costLimitLocked = true
            limitUpdated(e.detail.value)
          }} />&nbsp;ETH</button>
      <Warning
        show={!$fixedFee && $limit < $estimatedCost * 2n}
        tooltip="The fee limit is close to or below the current network cost. Consider increasing the limit to allow for gas cost fluctuations" />
    </div>
  </div>
  <div class="rounded-b-lg bg-slate-100 mt-[1px] py-1">
    <div class="flex flex-row px-3 leading-10 justify-between">
      <div class="flex flex-row">
        <button class="flex mr-2" on:click={() => showToolbox('settings')}>⚙️</button>
        <button class="flex" on:click={() => showToolbox('details')}>📐</button>
      </div>
      <span class="tooltip text-2xl leading-10" data-tip="Estimated tokens to be delivered">
        {#if !$fixedFee}~
        {/if}{humanReadableNumber(deliveredAmount > 0n ? deliveredAmount : 0n)}
        {asset.symbol}</span>
    </div>
  </div>
</div>

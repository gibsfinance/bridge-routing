<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { formatUnits, parseUnits } from 'viem'
  import NetworkSummary from './NetworkSummary.svelte'
  import { decimalValidation, humanReadableNumber, type Asset } from '$lib/stores/utils'
  import { loading } from '$lib/stores/loading'
  import Loading from '$lib/components/Loading.svelte'
  import {
    bridgeFrom,
    limit,
    loadFeeFor,
    incentiveFee,
    latestBaseFeePerGas,
    amountAfterBridgeFee,
    gasBasedFee,
    fixedFee,
    foreignSupportsEIP1559,
    estimatedCost,
    baseFeeReimbersement,
  } from '$lib/stores/bridge-settings'
  import { Chains, type VisualChain } from '$lib/stores/auth/types'
  import { createPublicClient, http } from 'viem'
  import SmallInput from './SmallInput.svelte'
  import Warning from './Warning.svelte'
  export let originationNetwork!: VisualChain
  export let destinationNetwork!: VisualChain
  export let asset!: Asset
  const dispatch = createEventDispatcher()
  const showToolbox = (type: string) => {
    dispatch('toggle', type)
  }
  $: publicClient = createPublicClient({
    chain: destinationNetwork,
    transport: http(),
  })
  let unwatch!: () => void
  const doUnwatch = () => {
    loading.increment('gas')
    unwatch?.()
  }
  $: if (publicClient) {
    doUnwatch()
    unwatch = publicClient.watchBlocks({
      emitOnBegin: true,
      onBlock: async (block) => {
        let perGas = block.baseFeePerGas
        if (!perGas) {
          perGas = await publicClient.getGasPrice()
          const minGWei = 2_500_000_000n
          if (perGas < minGWei) {
            perGas = minGWei
          }
        }
        latestBaseFeePerGas.update(() => perGas)
        loading.decrement('gas')
      },
    })
  }
  onMount(() => () => unwatch?.())
  $: loadFeeFor(originationNetwork.chainId, destinationNetwork.chainId)
  const limitUpdated = (lim: string) => {
    limit.set(parseUnits(lim, 18))
  }
  const incentiveFeeUpdated = (incFee: string) => {
    incentiveFee.set(parseUnits(incFee, 18) / 100n)
  }
  const defaultIncFee = '10'
  incentiveFeeUpdated(defaultIncFee)
  let defaultLimit = '0.001'
  let costLimitLocked = false
  // only happens once
  limitUpdated(defaultLimit)
  $: {
    if (!costLimitLocked && !$fixedFee) {
      // let it float as the base fee per gas is updated
      const lowResLimit = $latestBaseFeePerGas / (10n ** 8n * 5n)
      let lim = lowResLimit * 10n ** 15n
      if (lim > $amountAfterBridgeFee) {
        lim = $amountAfterBridgeFee
      }
      const proposedDefaultLimit = formatUnits(lim, asset.decimals)
      if (proposedDefaultLimit !== defaultLimit) {
        defaultLimit = proposedDefaultLimit
        limitUpdated(defaultLimit)
      }
    }
  }
  let balance = 0n
  const focusOnInputChild = (e: any) => {
    e.currentTarget.querySelector('input')?.focus()
  }
  const toggleFixedFee = () => {
    fixedFee.update(($ff) => !$ff)
  }
  $: bridgeFee = humanReadableNumber(
    $bridgeFrom.get(originationNetwork.chainId)!.get(destinationNetwork.chainId)!.feeH2F * 100n,
  )
  // $: console.log($limit, $estimatedCost, $limit < $estimatedCost * 2n)
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg">
    <NetworkSummary network={destinationNetwork} {asset} {balance} native />
  </div>
  <div class="bg-slate-100 mt-[1px] py-1">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <span>Bridge Fee</span>
      <span
        class="cursor-not-allowed tooltip tooltip-top tooltip-left-toward-center flex items-end self-end"
        data-tip="Fee set on the bridge">
        <Loading key="fee">{bridgeFee}</Loading>%
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
        <button class="px-1" on:click={toggleFixedFee}>
          {destinationNetwork.chainId === Chains.BNB ? 'Gas' : 'Base'}
        </button>
      </span>
      <button
        class="flex flex-row strike tooltip tooltip-top tooltip-left-toward-center"
        data-tip={$fixedFee
          ? 'Fee uses fixed value defined in cost limit'
          : `Percentage of gas used * ${$foreignSupportsEIP1559 ? 'base fee' : 'gas price'} to allocate to the transaction runner for performing this action`}
        class:line-through={!$gasBasedFee}
        on:click={focusOnInputChild}>
        ⛽ +<SmallInput
          value={defaultIncFee}
          suffix="%"
          validate={(v) => decimalValidation(v, 18)}
          on:update={(e) => incentiveFeeUpdated(e.detail.value)} />
      </button>
    </div>
  </div>
  <div class="bg-slate-100 mt-[1px] py-1 relative">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <button
        class="tooltip tooltip-top tooltip-right-toward-center"
        data-tip="Allows cost limit to float with the destination chain's base fee. While unlocked the number in the ui may change. Once a transaction is sent, the number in that transaction's calldata is fixed"
        on:click={() => {
          costLimitLocked = !costLimitLocked
        }}>
        Cost Limit&nbsp;{#if costLimitLocked || $fixedFee}🔒{:else}🔓{/if}
      </button>
      <button
        class="tooltip tooltip-top tooltip-left-toward-center flex flex-row items-end self-end"
        data-tip={$fixedFee
          ? 'The fixed fee to tip if the validator does the work'
          : 'The max you are willing to tip to the address delivering native eth'}
        on:click={focusOnInputChild}>
        &lt;=&nbsp;<Loading key="gas">
          <SmallInput
            value={defaultLimit}
            suffix={asset.native?.symbol || asset.symbol}
            validate={(v) => decimalValidation(v, 18)}
            on:update={(e) => {
              if (e.detail.fromInput) costLimitLocked = true
              limitUpdated(e.detail.value)
            }} />
        </Loading>
      </button>
      <Warning
        show={$fixedFee ? $limit < $baseFeeReimbersement * 2n : $limit < $estimatedCost * 2n}
        tooltip="The fee limit is close to or below the current network cost. Consider increasing the limit to allow for gas cost fluctuations" />
    </div>
  </div>
  <div class="rounded-b-lg bg-slate-100 mt-[1px] py-1">
    <div class="flex flex-row px-3 leading-10 justify-between">
      <div class="flex flex-row">
        <button class="flex mr-2" on:click={() => showToolbox('settings')}>⚙️</button>
        <button class="flex" on:click={() => showToolbox('details')}>📐</button>
      </div>
      <span
        class="tooltip text-xl sm:text-2xl leading-10 flex items-end self-end tooltip-top tooltip-left-toward-center"
        data-tip="Estimated tokens to be delivered. If the base fee is used, then this value will change as the base fee fluctuates on ethereum">
        {#if !$fixedFee}~&nbsp;{/if}<Loading>
          {humanReadableNumber(
            $amountAfterBridgeFee - $estimatedCost > 0n ? $amountAfterBridgeFee - $estimatedCost : 0n,
          )}
        </Loading>&nbsp;{asset.native?.symbol || asset.symbol}
      </span>
    </div>
  </div>
</div>

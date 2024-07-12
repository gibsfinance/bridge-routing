<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { formatUnits, parseUnits } from 'viem'
  import NetworkSummary from './NetworkSummary.svelte'
  import { decimalValidation, humanReadableNumber } from '$lib/stores/utils'
  import { loading } from '$lib/stores/loading'
  import Loading from '$lib/components/Loading.svelte'
  import UndercompensatedWarning from '$lib/components/warnings/Undercompensated.svelte'
  import FeeTypeToggle from '$lib/components/FeeTypeToggle.svelte'
  import {
    bridgeFrom,
    limit,
    loadFeeFor,
    incentiveFee,
    basisPointIncentiveFee,
    latestBaseFeePerGas,
    amountAfterBridgeFee,
    foreignSupportsEIP1559,
    estimatedCost,
    baseFeeReimbersement,
    incentiveRatio,
    unwrap,
    priceCorrective,
    oneEther,
    amountToBridge,
    feeType,
    // loggedCost,
  } from '$lib/stores/bridge-settings'
  import { Chains, type VisualChain } from '$lib/stores/auth/types'
  import { createPublicClient, http } from 'viem'
  import SmallInput from './SmallInput.svelte'
  import Warning from './Warning.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import * as utils from '$lib/utils'
  import type { Token } from '$lib/types'
  export let originationNetwork!: VisualChain
  export let destinationNetwork!: VisualChain
  export let asset!: Token
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
    loading.decrement('gas')
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
    limit.set(parseUnits(lim, asset.decimals))
  }
  const incentiveFeeUpdated = (incFee: string) => {
    const val = parseUnits(incFee, 18) / 100n
    const store = $feeType === 'gas+%' ? incentiveFee : $feeType === '%' ? basisPointIncentiveFee : null
    if (!store) return
    store.set(val)
  }
  const defaultIncFee = '10'
  const defaultBasisPointIncFee = '0.2'
  $: incentiveFeeUpdated($feeType === 'gas+%' ? defaultIncFee : defaultBasisPointIncFee)
  let defaultLimit = '0.001'
  let costLimitLocked = false
  // only happens once
  $: asset && limitUpdated(defaultLimit)
  $: {
    if ($feeType === 'fixed') {
      defaultLimit = '0.01'
      limitUpdated(defaultLimit)
    } else if ($feeType === '%' && asset) {
      let lim = 0n
      lim = ($amountAfterBridgeFee * $basisPointIncentiveFee) / oneEther
      const proposedDefaultLimit = formatUnits(lim, asset.decimals)
      if (proposedDefaultLimit !== defaultLimit) {
        defaultLimit = proposedDefaultLimit
        limitUpdated(defaultLimit)
      }
    } else if (!costLimitLocked && $feeType === 'gas+%' && asset) {
      // let it float as the base fee per gas is updated
      const lowResLimit = $latestBaseFeePerGas / (10n ** 8n * 5n)
      let lim = lowResLimit * 10n ** 15n
      lim = (lim * oneEther) / $priceCorrective / (oneEther / 10n ** BigInt(asset.decimals))
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
  $: bridgeFee = humanReadableNumber(
    $bridgeFrom.get(originationNetwork.chainId)!.get(destinationNetwork.chainId)!.feeH2F * 100n,
  )
  $: networkOptions = Object.keys(chainsMetadata).filter((cId): cId is Chains => cId !== Chains.PLS)
  $: decimals = asset.decimals
  $: expectedAmountOut =
    $amountToBridge &&
    humanReadableNumber(
      $amountAfterBridgeFee - $estimatedCost > 0n ? $amountAfterBridgeFee - $estimatedCost : 0n,
      decimals,
    )
</script>

<!-- <div class="hidden">{$loggedCost}</div> -->
<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg">
    <NetworkSummary network={destinationNetwork} {networkOptions} {asset} {balance} unwrap={$unwrap} />
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
  <div class="bg-slate-100 mt-[1px] py-1 relative">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <span class="flex items-center">
        <span class="mr-1">Delivery Fee</span>
        <FeeTypeToggle
          active={$feeType}
          options={[
            { key: 'fixed', text: 'Fixed' },
            { key: 'gas+%', text: '⛽+%' },
            { key: '%', text: '%' },
          ]}
          on:change={(e) => {
            feeType.set(e.detail.key)
          }} />
      </span>
      <button
        class="flex flex-row strike tooltip tooltip-top tooltip-left-toward-center"
        data-tip={$feeType === 'fixed'
          ? 'Fee uses fixed value defined in cost limit'
          : $feeType === 'gas+%'
            ? `Percentage of gas used * ${$foreignSupportsEIP1559 ? 'base fee' : 'gas price'} to allocate to the transaction runner for performing this action`
            : 'the percentage of bridged tokens after the bridge fee'}
        class:line-through={$feeType === 'fixed'}
        on:click={focusOnInputChild}>
        {#if $feeType !== 'fixed'}
          <span class:hidden={$feeType !== 'gas+%'}>⛽&nbsp;+</span><SmallInput
            value={$feeType === '%' ? defaultBasisPointIncFee : defaultIncFee}
            suffix="%"
            validate={(v) => decimalValidation(v)}
            on:update={(e) => incentiveFeeUpdated(e.detail.value)} />
        {/if}
      </button>
    </div>
    <UndercompensatedWarning />
    <!-- <Warning
      show={$feeType === 'gas+%' && $incentiveRatio < 10n ** 18n + 5n * 10n ** 16n}
      tooltip="A gas based fee of this amount may cause the executor to ignore your transaction" /> -->
  </div>
  <div class="bg-slate-100 mt-[1px] py-1 relative">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <button
        class="tooltip tooltip-top tooltip-right-toward-center"
        data-tip="Allows cost limit to float with the destination chain's base fee. While unlocked the number in the ui may change. Once a transaction is sent, the number in that transaction's calldata is fixed"
        on:click={() => {
          costLimitLocked = !costLimitLocked
        }}>
        Cost Limit&nbsp;{#if costLimitLocked || $feeType !== 'gas+%'}🔒{:else}🔓{/if}
      </button>
      <button
        class="tooltip tooltip-top tooltip-left-toward-center flex flex-row items-end self-end"
        data-tip={$feeType === 'fixed'
          ? 'The fixed fee to tip if the validator does the work'
          : 'The max you are willing to tip to the address delivering native eth'}
        on:click={focusOnInputChild}>
        &lt;=&nbsp;<Loading key="gas">
          <SmallInput
            value={defaultLimit}
            suffix={utils.nativeSymbol(asset)}
            validate={(v) => decimalValidation(v, asset.decimals)}
            on:update={(e) => {
              if (e.detail.fromInput) costLimitLocked = true
              limitUpdated(e.detail.value)
            }} />
        </Loading>
      </button>
      <Warning
        show={$amountAfterBridgeFee < 0n && $limit < $baseFeeReimbersement * 2n}
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
        class="tooltip text-xl sm:text-2xl leading-10 flex items-center self-center tooltip-top tooltip-left-toward-center"
        data-tip="Estimated tokens to be delivered. If the base fee is used, then this value will change as the base fee fluctuates on ethereum">
        {#if $feeType === 'gas+%'}~&nbsp;{/if}<Loading>
          {expectedAmountOut}
        </Loading>&nbsp;{utils.nativeSymbol(asset)}
      </span>
    </div>
  </div>
</div>

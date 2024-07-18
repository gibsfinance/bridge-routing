<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { formatEther, formatUnits, parseEther, parseUnits } from 'viem'
  import NetworkSummary from './NetworkSummary.svelte'
  import { decimalValidation, humanReadableNumber } from '$lib/stores/utils'
  import { loading } from '$lib/stores/loading'
  import Loading from '$lib/components/Loading.svelte'
  import LockIcon from '$lib/components/LockIcon.svelte'
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
    unwrap,
    priceCorrective,
    oneEther,
    amountToBridge,
    feeType,
    isNative,
    estimatedNetworkCost,
    incentiveRatio,
  } from '$lib/stores/bridge-settings'
  import { Chains, type VisualChain } from '$lib/stores/auth/types'
  import { createPublicClient, http } from 'viem'
  import SmallInput from './SmallInput.svelte'
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
    unwatch?.()
  }
  $: if (publicClient) {
    doUnwatch()
    loading.increment('gas')
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
  const getDefaultIncentiveFee = (asset: Token) => {
    if (isNative(asset)) {
      return '10'
    }
    return '50'
  }
  $: defaultIncFee = getDefaultIncentiveFee(asset)
  $: incentiveFeeUpdated($feeType === 'gas+%' ? defaultIncFee : defaultBasisPointIncFee)
  let defaultLimit = '0.001'
  let defaultBasisPointIncFee = '0.2'
  let costLimitLocked = false
  let deliveryFeeLocked = false
  const scaledBasisPoint = parseEther('0.01')
  // only happens once
  $: asset && limitUpdated(defaultLimit)
  $: {
    if ($feeType === 'fixed') {
      // defaultLimit = '0.01'
      // limitUpdated(defaultLimit)
    } else if (!deliveryFeeLocked && $feeType === '%' && asset) {
      // if (lim > 0n) {
      if ($amountAfterBridgeFee) {
        const max = parseEther('2')
        const min = parseEther('0.05')
        const ratioOffset = $estimatedNetworkCost / ($amountAfterBridgeFee / 25_000n)
        let target = min + scaledBasisPoint * ratioOffset
        if (target > max) {
          target = max
        } else if (target < min) {
          target = min
        }
        defaultBasisPointIncFee = formatUnits(target, 18)
      } else {
        defaultBasisPointIncFee = '2'
      }
      incentiveFeeUpdated(defaultBasisPointIncFee)
      let lim = 0n
      lim = ($amountAfterBridgeFee * $basisPointIncentiveFee) / oneEther
      const proposedDefaultLimit = formatUnits(lim, asset.decimals)
      if (proposedDefaultLimit !== defaultLimit) {
        defaultLimit = proposedDefaultLimit
        limitUpdated(defaultLimit)
      }
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
      const lowResLimit = ($latestBaseFeePerGas * $incentiveRatio) / (10n ** 8n * 10n * oneEther)
      let lim = lowResLimit * 10n ** 15n
      if ($priceCorrective > 0n) {
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
      Math.floor(decimals / 3),
    )
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg hover:z-10">
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
  <div class="bg-slate-100 mt-[1px] py-1 relative hover:z-10">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <span class="flex items-center">
        <span class="mr-1">Delivery Fee</span>&nbsp;
        <FeeTypeToggle
          active={$feeType}
          options={[
            { key: 'fixed', text: 'Fixed' },
            { key: 'gas+%', text: '⛽+%' },
            { key: '%', text: '%' },
          ]}
          on:change={(e) => {
            feeType.set(e.detail.key)
          }} />{#if $feeType === '%'}<button
            type="button"
            class="flex px-1"
            on:click={() => {
              deliveryFeeLocked = !deliveryFeeLocked
            }}><LockIcon locked={deliveryFeeLocked} /></button
          >{/if}
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
            isNumber
            value={$feeType === '%' ? defaultBasisPointIncFee : defaultIncFee}
            suffix="%"
            validate={(v) => decimalValidation(v)}
            on:update={(e) => {
              if (e.detail.fromInput) deliveryFeeLocked = true
              incentiveFeeUpdated(e.detail.value)
            }} />
        {/if}
      </button>
    </div>
    <UndercompensatedWarning />
  </div>
  <div class="bg-slate-100 mt-[1px] py-1 relative hover:z-10">
    <div class="flex flex-row px-3 leading-8 justify-between">
      <button
        class="tooltip tooltip-top tooltip-right-toward-center"
        data-tip="Allows cost limit to float with the destination chain's base fee. While unlocked the number in the ui may change. Once a transaction is sent, the number in that transaction's calldata is fixed"
        on:click={() => {
          costLimitLocked = !costLimitLocked
        }}>
        Cost&nbsp;{#if $feeType === 'gas+%'}Limit&nbsp;<LockIcon
            locked={costLimitLocked || $feeType !== 'gas+%'} />{/if}
      </button>
      <button
        class="tooltip tooltip-top tooltip-left-toward-center flex flex-row items-end self-end"
        data-tip={$feeType === 'fixed'
          ? 'The fixed fee to tip if the validator does the work'
          : 'The max you are willing to tip to the address'}
        on:click={focusOnInputChild}>
        <Loading key="gas">
          {#if $feeType === '%'}
            <span>{humanReadableNumber(parseUnits(defaultLimit, asset.decimals), asset.decimals)}</span>
          {:else}
            <SmallInput
              isNumber
              value={defaultLimit}
              suffix={utils.nativeSymbol(asset)}
              validate={(v) => decimalValidation(v, asset.decimals)}
              on:update={(e) => {
                if (e.detail.fromInput) costLimitLocked = true
                limitUpdated(e.detail.value)
              }} />
          {/if}
        </Loading>
      </button>
    </div>
  </div>
  <div class="rounded-b-lg bg-slate-100 mt-[1px] py-1 hover:z-10">
    <div class="flex flex-row px-3 leading-10 justify-between">
      <div class="flex flex-row">
        <button class="flex mr-2" on:click={() => showToolbox('settings')}>⚙️</button>
        <button class="flex" on:click={() => showToolbox('details')}>📐</button>
      </div>
      <span
        class="tooltip text-xl sm:text-2xl leading-10 flex items-center self-center tooltip-top tooltip-left-toward-center"
        data-tip="Estimated tokens to be delivered. If the base fee is used, then this value will change as the base fee fluctuates on ethereum">
        {#if $feeType === 'gas+%'}~&nbsp;{/if}<Loading key="gas">
          {expectedAmountOut}
        </Loading>&nbsp;{utils.nativeSymbol(asset)}
      </span>
    </div>
  </div>
</div>

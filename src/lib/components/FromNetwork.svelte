<script lang="ts">
  import NetworkSummary from './NetworkSummary.svelte'
  import { walletAccount } from '$lib/stores/auth/store'
  import { erc20Abi, formatUnits, parseUnits } from 'viem'
  import type { VisualChain } from '$lib/stores/auth/types'
  import { decimalValidation, type Asset } from '$lib/stores/utils'
  import { publicClient } from '$lib/stores/auth/store'
  import { writable } from 'svelte/store'
  import { amountToBridge, assets, bridgeKey, inputBridgeAbi } from '$lib/stores/bridge-settings'
  import { validatable } from '$lib/stores/validatable'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import { loading } from '$lib/stores/loading'
  import Warning from './Warning.svelte'

  export let network!: VisualChain
  export let asset!: Asset
  let value = validatable('', (v) => decimalValidation(v, asset.decimals))
  const val = writable('')
  value.subscribe((v) => {
    amountToBridge.set(v ? parseUnits(v, asset.decimals) : 0n)
  })
  amountToBridge.set(0n)
  let balance = 0n
  const getBalance = async () => {
    if (!$walletAccount) {
      return null
    }
    loading.increment('balance')
    return $publicClient.readContract({
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [$walletAccount],
      address: asset.address,
    })
  }
  const getMinAmount = async () => {
    return $publicClient.readContract({
      abi: inputBridgeAbi,
      functionName: 'minPerTx',
      args: [assets[$bridgeKey].input.address],
      address: assets[$bridgeKey].homeBridge,
    })
  }

  $: $walletAccount &&
    getBalance().then((res) => {
      loading.decrement('balance')
      balance = res || 0n
    })

  let unwind!: () => void
  const doUnwind = () => {
    loading.increment('minAmount')
    balance = 0n
    unwind?.()
  }
  const minInput = writable(0n)
  const focused = writable(false)
  $: {
    doUnwind()
    if ($publicClient) {
      getBalance().then((res) => {
        loading.decrement('balance')
        balance = res || 0n
      })
      // assume that the min amount will not change while the page is loaded
      getMinAmount().then((res) => {
        minInput.set(res)
        loading.decrement('minAmount')
      })
      unwind = $publicClient.watchContractEvent({
        address: asset.address,
        abi: erc20Abi,
        eventName: 'Transfer',
        onLogs: async (logs) => {
          const transfer = logs.filter((l) => l.eventName === 'Transfer')
          if (transfer.length) {
            balance = (await getBalance()) || 0n
          }
        },
      })
    }
  }
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg">
    <NetworkSummary
      {network}
      {asset}
      {balance}
      showMax
      on:max-balance={() => {
        value.set(formatUnits(balance, asset.decimals))
        val.set($value)
      }} />
  </div>
  <div class="flex flex-row mt-[1px] bg-slate-100 rounded-b-lg text-xl justify-between">
    <span class="flex flex-grow relative max-w-[70%]">
      <input
        class="bg-transparent leading-8 outline-none px-3 py-2 placeholder-current hover:appearance-none focus:shadow-inner flex-grow text-xl sm:text-2xl w-full"
        placeholder="0.0"
        bind:value={$val}
        on:focus={() => focused.set(true)}
        on:blur={() => focused.set(false)}
        on:input={(e) => {
          value.set(e.currentTarget.value)
          val.set($value)
        }} />
      <Warning
        show={!!$value && parseUnits($value, asset.decimals) < $minInput}
        disabled={$focused}
        position="left"
        tooltip="Input is too low, must be at least {formatUnits($minInput, asset.decimals)}" />
    </span>
    <span class="tooltip tooltip-left leading-8 py-2 px-3 flex flex-row" data-tip={asset.name}>
      <AssetWithNetwork {asset} tokenSize={8} networkSize={4} />
      <span class="ml-2">{asset.symbol}</span>
    </span>
  </div>
</div>

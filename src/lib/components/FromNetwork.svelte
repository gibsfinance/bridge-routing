<script lang="ts">
  import NetworkSummary from './NetworkSummary.svelte'
  import { walletAccount } from '$lib/stores/auth/store'
  import { erc20Abi, formatUnits, parseUnits } from 'viem'
  import NetworkImage from './NetworkImage.svelte'
  import type { VisualChain } from '$lib/stores/auth/types'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { decimalValidation, type Asset } from '$lib/stores/utils'
  import { onMount } from 'svelte'
  import { publicClient } from '$lib/stores/auth/store'
  import { get, writable } from 'svelte/store'
  import { amountToBridge } from '$lib/stores/bridge-settings'
  import * as validatableStore from '$lib/stores/validatable'

  export let network!: VisualChain
  export let asset!: Asset
  $: networkOrigination = chainsMetadata[asset.networkOrigination]
  let value = validatableStore.create('', (v) => decimalValidation(v, asset.decimals))
  const val = writable('')
  value.subscribe((v) => {
    amountToBridge.set(v ? parseUnits(v, asset.decimals) : 0n)
  })
  amountToBridge.set(0n)
  let balance = 0n
  const getBalance = async () => {
    const account = get(walletAccount)
    if (!account) {
      return null
    }
    return get(publicClient).readContract({
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account],
      address: asset.address,
    })
  }
  $: $walletAccount &&
    getBalance().then((res) => {
      balance = res || 0n
    })

  onMount(() => {
    getBalance().then((res) => {
      balance = res || 0n
    })
    return get(publicClient).watchContractEvent({
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
  })
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
      }} />
  </div>
  <div class="flex flex-row mt-[1px] bg-slate-100 rounded-b-lg text-xl justify-between">
    <input
      class="bg-transparent leading-8 outline-none px-3 py-2 placeholder-current hover:appearance-none focus:shadow-inner flex-grow text-2xl"
      placeholder="0.0"
      bind:value={$val}
      on:input={(e) => {
        value.set(e.currentTarget.value)
        val.set($value)
      }} />
    <span class="tooltip leading-8 py-2 px-3 flex flex-row" data-tip={asset.name}>
      <NetworkImage network={networkOrigination} />{asset.symbol}
    </span>
  </div>
</div>

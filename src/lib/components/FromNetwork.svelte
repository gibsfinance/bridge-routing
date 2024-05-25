<script lang="ts">
  import NetworkSummary from './NetworkSummary.svelte'
  import { walletAccount } from '$lib/stores/auth/store'
  import { erc20Abi, formatUnits, parseEther, parseUnits } from 'viem'
  import NetworkImage from './NetworkImage.svelte'
  import type { VisualChain } from '$lib/stores/auth/types'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import type { Asset } from '$lib/stores/utils'
  import { onMount } from 'svelte'
  import { publicClient } from '$lib/stores/auth/store'
  import { get } from 'svelte/store'
  import { amountToBridge } from '$lib/stores/bridge-settings'

  export let network!: VisualChain
  export let asset!: Asset
  $: networkOrigination = chainsMetadata[asset.networkOrigination]
  let value = ''
  let prev = ''
  let balance = 0n
  const decimals = 18
  const runValidation = () => {
    let v: bigint | undefined = undefined
    // let addingZero = false
    // let trailingZeros = 0
    try {
      if (value === '') {
        amountToBridge.set(0n)
        return
      }
      v = parseUnits(value, decimals)
    } catch (err) {
      console.log(err, v)
    }
    if (v && v < 0n) {
      v = undefined
    }
    const split = value.split('.')
    if (
      typeof v === 'bigint' &&
      split.length <= 2 &&
      (split.length === 1 || split[1].length <= decimals)
    ) {
      amountToBridge.set(v)
      prev = value
    } else {
      value = prev
    }
  }
  const getBalance = async () => {
    const account = get(walletAccount)
    if (!account) {
      return null
    }
    console.log('getting balance of %o for %o', account, asset.address)
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
      onError: (error) => console.log(error),
      onLogs: async (logs) => {
        const transfer = logs.filter((l) => l.eventName === 'Transfer')
        if (transfer.length) {
          balance = (await getBalance()) || 0n
        }
      },
    })
  })
  // $: amountToBridge.set(value ? parseEther(value) : 0n)
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg">
    <NetworkSummary
      {network}
      {asset}
      {balance}
      showMax
      on:max-balance={() => {
        value = formatUnits(balance, asset.decimals)
      }} />
  </div>
  <div class="flex flex-row mt-[1px] bg-slate-100 rounded-b-lg text-xl justify-between">
    <input
      class="bg-transparent leading-8 outline-none px-3 py-2 placeholder-current hover:appearance-none focus:shadow-inner flex-grow text-2xl"
      placeholder="0.0"
      bind:value
      on:input={runValidation} />
    <span class="tooltip leading-8 py-2 px-3 flex flex-row" data-tip={asset.name}>
      <NetworkImage network={networkOrigination} />{asset.symbol}
    </span>
  </div>
</div>

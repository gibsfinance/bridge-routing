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
  let balance = 0n
  const decimals = 18
  const runValidation = () => {
    let v!: bigint
    try {
      v = parseUnits(value, decimals)
    } catch (err) {
      console.log('failed during parse', value)
      value = ''
    }
    if (v < 0n) {
      console.log('value less than 0', value)
      value = ''
    }
    value = formatUnits(v, decimals)
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
      poll: true,
      onLogs: async (logs) => {
        const transfer = logs.filter((l) => l.eventName === 'Transfer')
        if (transfer.length) {
          balance = (await getBalance()) || 0n
        }
      },
    })
  })
  $: amountToBridge.set(value ? parseEther(value) : 0n)
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
      on:change={runValidation} />
    <span class="tooltip leading-8 py-2 px-3 flex flex-row" data-tip={asset.name}>
      <NetworkImage network={networkOrigination} />{asset.symbol}
    </span>
  </div>
</div>

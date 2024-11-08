<script lang="ts">
  import Icon from '@iconify/svelte'
  import { bridgeKey, destinationRouter } from '$lib/stores/input'
  import { Chains } from '$lib/stores/auth/types'
  import { type as modalType } from '$lib/stores/modal'
  const openModal = () => {
    modalType.set('info')
  }
  const chainToDomain = {
    [Chains.ETH]: 'etherscan.io',
    [Chains.BNB]: 'bscscan.com',
    [Chains.PLS]: 'scan.pulsechain.com',
    [Chains.V4PLS]: 'scan.v4.testnet.pulsechain.com',
    [Chains.SEP]: 'sepolia.etherscan.io',
  }
  $: toChain = $bridgeKey[2]
  $: isEth = toChain === Chains.ETH || toChain === Chains.SEP
  $: domain = chainToDomain[toChain]
  $: icon = isEth ? 'token:ethereum' : 'token:binance-smart-chain'
</script>

<div class="flex flex-row">
  <button
    type="button"
    class="border-2 rounded-full h-8 w-8 mr-2 flex justify-center items-center hover:text-slate-500"
    on:click={openModal}>
    <Icon icon="entypo:info" />
  </button>

  <a
    aria-label="github repository"
    href="https://github.com/orgs/gibsfinance/repositories"
    target="_blank"
    class="mr-2">
    <button
      class="border-2 rounded-full h-8 w-8 flex justify-center items-center hover:text-slate-500">
      <Icon icon="fe:github-alt" height="1.5em" width="1.5em" />
    </button>
  </a>
  <a
    aria-label="router code on block explorer"
    href={`https://${domain}/address/${$destinationRouter}#code`}
    target="_blank"
    class="mr-2">
    <button
      class="border-2 rounded-full h-8 w-8 flex justify-center items-center hover:text-slate-500">
      <Icon {icon} height="1.5em" width="1.5em" />
    </button>
  </a>
  <a aria-label="x.com profile" href="https://x.com/gibsfinance" target="_blank" class="mr-2">
    <button
      class="border-2 rounded-full h-8 w-8 flex justify-center items-center hover:text-slate-500">
      <Icon icon="ri:twitter-fill" height="1.25em" width="1.25em" />
    </button>
  </a>
  <a
    href="https://t.me/+6ejcIlIAbL5lYzFh"
    target="_blank"
    class="mr-2"
    aria-label="a link to the telegram channel">
    <button
      class="border-2 rounded-full size-8 flex justify-center items-center hover:text-slate-500">
      <Icon icon="line-md:telegram" height="1.25em" width="1.25em" />
    </button>
  </a>
</div>

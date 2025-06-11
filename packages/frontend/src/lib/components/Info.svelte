<script lang="ts">
  import Icon from '@iconify/svelte'
  import { Chains } from '@gibsfinance/bridge-sdk/config'

  import { bridgeKey } from '../stores/input.svelte'
  import { page } from '../stores/app-page.svelte'

  import InfoExplain from './InfoExplain.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import Button from './Button.svelte'

  const chainToDomain = {
    [Chains.ETH]: 'etherscan.io',
    [Chains.BNB]: 'bscscan.com',
    [Chains.PLS]: 'scan.pulsechain.com',
    [Chains.V4PLS]: 'scan.v4.testnet.pulsechain.com',
    [Chains.SEP]: 'sepolia.etherscan.io',
  }
  const toChain = $derived(bridgeKey.toChain)
  const domain = $derived(chainToDomain[toChain])
  const icon = 'token:ethereum'
  const destinationRouterHash = $derived(bridgeKey.destinationRouter)
</script>

<div class="flex flex-row">
  <ModalWrapper
    triggerClasses="border-2 rounded-full h-8 w-8 mr-2 flex justify-center items-center hover:text-slate-500">
    {#snippet button()}
      <Icon icon="entypo:info" />
    {/snippet}
    {#snippet contents()}
      <InfoExplain />
    {/snippet}
  </ModalWrapper>

  <a
    aria-label="github repository"
    href="https://github.com/gibsfinance/bridge-routing/issues"
    target="_blank"
    class="mr-2">
    <Button
      class="border-2 rounded-full h-8 w-8 flex justify-center items-center hover:text-slate-500">
      <Icon icon="fe:github-alt" height="1.5em" width="1.5em" />
    </Button>
  </a>
  <a
    aria-label="router code on block explorer"
    href={`https://${domain}/address/${destinationRouterHash}#code`}
    target="_blank"
    class="mr-2">
    <Button
      class="border-2 rounded-full h-8 w-8 flex justify-center items-center hover:text-slate-500">
      <Icon {icon} height="1.5em" width="1.5em" />
    </Button>
  </a>
  <a aria-label="x.com profile" href="https://x.com/gibsfinance" target="_blank" class="mr-2">
    <Button
      class="border-2 rounded-full h-8 w-8 flex justify-center items-center hover:text-slate-500">
      <Icon icon="mingcute:social-x-line" height="1.25em" width="1.25em" />
    </Button>
  </a>
  <a
    href="https://t.me/gibsfinance"
    target="_blank"
    class="mr-2"
    aria-label="a link to the telegram channel">
    <Button
      class="border-2 rounded-full size-8 flex justify-center items-center hover:text-slate-500">
      <Icon icon="line-md:telegram" height="1.25em" width="1.25em" />
    </Button>
  </a>
  <a href={`#${page.value}?mode=simple`} target="_blank" class="mr-2" aria-label="embed page">
    <Button
      class="border-2 rounded-full size-8 flex justify-center items-center hover:text-slate-500">
      <Icon icon="fluent-mdl2:embed" />
    </Button>
  </a>
</div>

<script lang="ts">
  import Icon from '@iconify/svelte'
  import { page } from '../stores/app-page.svelte'
  import Button from './Button.svelte'
  import { Accordion } from '@skeletonlabs/skeleton-svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { bridgableTokens, bridgeKey } from '../stores/input.svelte'
  import { Provider } from '../stores/auth/types'
  import { zeroAddress, type Hex } from 'viem'
  import ModalWrapper from './ModalWrapper.svelte'
  import SelectButtonContents from './SelectButtonContents.svelte'
  import _ from 'lodash'
  import * as settings from '../stores/settings.svelte'
  import * as nav from '../stores/nav.svelte'

  const relevantUrl = $derived.by(() => {
    const url = new URL(page.url.toString())
    const params = page.queryParams
    params.set('settings', settings.settings.DISABLED)
    const route = page.route.id
    const hash = `${route}${params.size ? `?${params.toString()}` : ''}`
    url.hash = hash
    return url.toString()
  })
  const copyCurrentUrl = $derived(() => {
    navigator.clipboard.writeText(relevantUrl)
  })
  const openCurrentUrl = $derived(() => {
    window.open(relevantUrl, '_blank')
  })
  const focused = $derived((page.settings === null || page.settings === 'open') ? null : page.settings)
  const open = $derived(page.settings !== null)
  const value = $derived(focused ? [focused] : [])
  // mode settings
  const embedOptions = [
    {
      name: 'Default',
      value: settings.mode.DEFAULT,
    },
    {
      name: 'Embed',
      value: 'embed',
    },
    {
      name: 'Simple',
      value: 'simple',
    },
  ]
  const embedOption = $derived(embedOptions.find(option => option.value === page.mode)!)
  // guide settings
  const guideOptions = [
    {
      name: 'Closed',
      value: settings.guide.CLOSED,
    },
    {
      name: 'Show',
      value: settings.guide.SHOW,
    },
  ]
  const guideOption = $derived(guideOptions.find(option => option.value === page.guide)!)
  // onboard settings
  const onrampsOptions = [
    {
      name: 'Closed',
      value: settings.onramps.CLOSED,
    },
    {
      name: 'Show',
      value: settings.onramps.SHOW,
    },
  ]
  const onrampsOption = $derived(onrampsOptions.find(option => option.value === page.onramps)!)
  // stage
  const stageOptions = [
    {
      name: 'Onboard',
      value: settings.stage.ONBOARD,
    },
    {
      name: "Swap",
      value: settings.stage.SWAP,
    },
  ]
  const stageOption = $derived(stageOptions.find(option => option.value === page.stage) ?? stageOptions[0])
  // advanced options for delivery
  const detailsOptions = [
    {
      name: 'Closed',
      value: settings.details.CLOSED,
    },
    {
      name: 'Show',
      value: settings.details.SHOW,
    },
  ]
  const detailsOption = $derived(detailsOptions.find(option => option.value === page.details)!)
  // bridge token in
  let bridgeTokenIn = $state(page.queryParams.get('bridgeTokenIn') ?? zeroAddress)
  const bridgeTokenInFromBridgeKey = $derived(bridgeKey.assetInAddress)
  $effect(() => {
    if (bridgeTokenInFromBridgeKey && bridgeTokenInFromBridgeKey !== bridgeTokenIn) {
      bridgeTokenIn = bridgeTokenInFromBridgeKey
    }
  })
  // pulsex token out
  const pulsexTokenOutFromSettings = $derived(page.queryParams.get('pulsexTokenOut') ?? zeroAddress)
  let pulsexTokenOut = $state(page.queryParams.get('pulsexTokenOut') ?? zeroAddress)
  $effect(() => {
    if (pulsexTokenOut && pulsexTokenOut !== pulsexTokenOutFromSettings) {
      pulsexTokenOut = pulsexTokenOutFromSettings
    }
  })
  const chainInputId = $derived(Number(bridgeKey.chain.id))
  const bridgeTokenInSettings = $derived({
    provider: bridgeKey.provider,
    chain: chainInputId,
    partnerChain: Number(bridgeKey.partnerChain?.id),
  })
  const bridgeTokensIn = $derived(bridgableTokens.bridgeableTokensUnder(bridgeTokenInSettings))
  const plsxTokensOut = $derived(bridgableTokens.bridgeableTokensUnder({
    provider: Provider.PULSECHAIN,
    chain: 369,
    partnerChain: 1,
  }))
</script>

<div class="w-0 transition-all duration-200 fixed flex flex-col top-0 bottom-0 h-screen" class:w-64={open}>
  <div class="flex flex-col bg-white top-0 right-0 w-64 grow h-full">
    <h2 class="text-2xl font-bold font-italiana py-2.5 px-4 text-surface-contrast-50 border-b border-gray-200">Embed Settings</h2>
    <div class="flex flex-col gap-2 text-surface-contrast-50 grow overflow-y-auto">
      <Accordion value={value} collapsible onValueChange={(e) => {
        page.setParam('settings', e.value[0] ?? 'true') // true means that the settings are open but nothing is 'focused'
      }} classes="[&>hr]:border-gray-200" spaceY="space-y-0">
        <Accordion.Item value="mode" panelPadding="p-2" controlPadding="px-2 py-3" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="iconoir:scale-frame-enlarge" class="size-6" />{/snippet}
          {#snippet control()}Mode{/snippet}
          {#snippet panel()}
          <fieldset>
            <ul class="flex flex-col gap-1">
              {#each embedOptions as option}
                <li>
                  <label for={`mode-${option.value}`}>
                    <Button class="flex grow flex-row items-center gap-2 p-2 w-full text-surface-contrast-50 justify-start border rounded-lg hover:bg-gray-100 transition-all transition-duration-100" onclick={() => {
                      page.setParam('mode', option.value)
                    }}>
                      <input type="radio" name="mode" id={`mode-${option.value}`} value={option.value} checked={option.value === embedOption.value} />
                      {option.name}
                    </Button>
                  </label>
                </li>
              {/each}
            </ul>
          </fieldset>
          {/snippet}
        </Accordion.Item>
        {#if page.params.page === 'delivery'}
        <hr class="hr" />
        <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="direction" disabled controlClasses="hover:bg-gray-100 cursor-not-allowed hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="material-symbols-light:settings-outline-rounded" class="size-6" />{/snippet}
          {#snippet control()}Direction{/snippet}
          <!-- {#snippet panel()}
          <fieldset>
            <ul class="flex flex-col gap-1">
              {#each directionOptions as option}
                <li>
                  <label for={`direction-${option.value}`}>
                    <Button class="flex grow flex-row items-center gap-2 p-2 w-full text-surface-contrast-50 justify-start border rounded-lg hover:bg-gray-100 transition-all transition-duration-100" onclick={() => {
                      // page.setParam('direction', option.value)
                    }}>
                      {option.name}
                    </Button>
                  </label>
                </li>
              {/each}
            </ul>
          </fieldset>
          {/snippet} -->
        </Accordion.Item>
        {/if}
        {#if page.route.id === '/onboard'}
        <hr class="hr" />
        <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="guide" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="material-symbols-light:map-outline" class="size-6" />{/snippet}
          {#snippet control()}Guide{/snippet}
          {#snippet panel()}
          <fieldset>
            <ul class="flex flex-col gap-1">
              {#each guideOptions as option}
                <li>
                  <label for={`guide-${option.value}`}>
                    <Button class="flex grow flex-row items-center gap-2 p-2 w-full text-surface-contrast-50 justify-start border rounded-lg hover:bg-gray-100 transition-all transition-duration-100" onclick={() => {
                      page.setParam('guide', option.value)
                    }}>
                      <input type="radio" name="guide" id={`guide-${option.value}`} value={option.value} checked={option.value === guideOption.value} />
                      {option.name}
                    </Button>
                  </label>
                </li>
              {/each}
            </ul>
          </fieldset>
          {/snippet}
        </Accordion.Item>
        <hr class="hr" />
        <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="onramps" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="healthicons:running-outline" class="size-6" />{/snippet}
          {#snippet control()}Onramps{/snippet}
          {#snippet panel()}
          <fieldset>
            <ul class="flex flex-col gap-1">
              {#each onrampsOptions as option}
                <li>
                  <label for={`onramps-${option.value}`}>
                    <Button class="flex grow flex-row items-center gap-2 p-2 w-full text-surface-contrast-50 justify-start border rounded-lg hover:bg-gray-100 transition-all transition-duration-100" onclick={() => {
                      page.setParam('onramps', option.value)
                    }}>
                      <input type="radio" name="onramps" id={`onramps-${option.value}`} value={option.value} checked={option.value === onrampsOption.value} />
                      {option.name}
                    </Button>
                  </label>
                </li>
              {/each}
            </ul>
          </fieldset>
          {/snippet}
        </Accordion.Item>
        <hr class="hr" />
        <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="stage" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="material-symbols-light:123-sharp" class="size-6" />{/snippet}
          {#snippet control()}Stage{/snippet}
          {#snippet panel()}
          <fieldset>
            <ul class="flex flex-col gap-1">
              {#each stageOptions as option}
                <li>
                  <label for={`onramps-${option.value}`}>
                    <Button class="flex grow flex-row items-center gap-2 p-2 w-full text-surface-contrast-50 justify-start border rounded-lg hover:bg-gray-100 transition-all transition-duration-100" onclick={() => {
                      page.setParam('stage', option.value)
                    }}>
                      <input type="radio" name="onramps" id={`onramps-${option.value}`} value={option.value} checked={option.value === stageOption.value} />
                      {option.name}
                    </Button>
                  </label>
                </li>
              {/each}
            </ul>
          </fieldset>
          {/snippet}
        </Accordion.Item>
        {/if}
        <hr class="hr" />
        <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="bridgeTokenIn" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="streamline:coin-share" />{/snippet}
          {#snippet control()}Bridge Token In{/snippet}
          {#snippet panel()}
            {@const token = bridgeTokensIn.find(token => token.address === bridgeTokenIn)!}
            <div class="flex flex-col gap-2">
              <ModalWrapper
                wrapperClasses="flex items-center justify-center h-full"
                triggerClasses=""
                contentClasses="">
                {#snippet button()}
                  <SelectButtonContents {token} network={token?.chainId ?? 0} class="bg-white" />
                {/snippet}
                {#snippet contents({ close })}
                  <TokenSelect
                    tokens={bridgeTokensIn}
                    chains={[chainInputId]}
                    selectedChain={chainInputId}
                    selectedToken={token}
                    onsubmit={(token) => {
                      const tokenInAddress = token?.address as Hex
                      if (page.params.page === 'delivery') {
                        nav.delivery.shallow(bridgeKey.value, tokenInAddress)
                      } else if (page.route.id === '/onboard') {
                        page.setParam('bridgeTokenIn', tokenInAddress)
                      }
                      close()
                    }}
                  />
                {/snippet}
              </ModalWrapper>
            </div>
          {/snippet}
        </Accordion.Item>
        {#if page.route.id === '/onboard'}
        <hr class="hr" />
        <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="pulsexTokenOut" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="ri:swap-3-line" />{/snippet}
          {#snippet control()}PulseX Token Out{/snippet}
          {#snippet panel()}
            {@const token = plsxTokensOut.find(token => token.address === pulsexTokenOut)!}
            <div class="flex flex-col gap-2">
              <ModalWrapper
                wrapperClasses="flex items-center justify-center h-full"
                triggerClasses=""
                contentClasses="">
                {#snippet button()}
                  <SelectButtonContents {token} network={token?.chainId ?? 0} class="bg-white" />
                {/snippet}
                {#snippet contents({ close })}
                  <TokenSelect
                    tokens={plsxTokensOut}
                    chains={[369]}
                    selectedChain={369}
                    selectedToken={token}
                    onsubmit={(token) => {
                      const tokenInAddress = token?.address as Hex
                      page.setParam('pulsexTokenOut', tokenInAddress)
                      close()
                    }}
                  />
                {/snippet}
              </ModalWrapper>
            </div>
          {/snippet}
        </Accordion.Item>
        {/if}
        {#if page.params.page === 'delivery'}
          <hr class="hr" />
          <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="details" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
            {#snippet lead()}<Icon icon="mdi:magnify" class="size-6" />{/snippet}
            {#snippet control()}Details{/snippet}
            {#snippet panel()}
              <fieldset>
                <ul class="flex flex-col gap-1">
                  {#each detailsOptions as option}
                    <li>
                      <label for={`details-${option.value}`}>
                        <Button class="flex grow flex-row items-center gap-2 p-2 w-full text-surface-contrast-50 justify-start border rounded-lg hover:bg-gray-100 transition-all transition-duration-100" onclick={() => {
                          page.setParam('details', option.value)
                        }}>
                          <input type="radio" name="details" id={`details-${option.value}`} value={option.value} checked={option.value === detailsOption.value} />
                          {option.name}
                        </Button>
                      </label>
                    </li>
                  {/each}
                </ul>
              </fieldset>
            {/snippet}
          </Accordion.Item>
        {/if}
      </Accordion>
    </div>
    <div class="grid grid-cols-2 gap-1 h-14 w-full p-2 sticky bottom-0 bg-white border-t border-gray-200">
      <Button class="flex grow flex-row items-center gap-2 text-surface-contrast-50 justify-center border rounded-lg hover:bg-gray-100 transition-all transition-duration-100 h-10" onclick={copyCurrentUrl}>
        <Icon icon="mdi:content-copy" class="size-6" />
      </Button>
      <Button class="flex grow flex-row items-center gap-2 text-surface-contrast-50 justify-center border rounded-lg hover:bg-gray-100 transition-all transition-duration-100 h-10" onclick={openCurrentUrl}>
        <Icon icon="majesticons:open" class="size-6" />
      </Button>
    </div>
  </div>

</div>
<button class="flex bottom-16 size-8 z-10 fixed items-center justify-center border border-gray-200 bg-gray-50 hover:bg-gray-100 text-surface-contrast-50 transition-all duration-200"
  type="button"
  class:rounded-r-full={!open}
  class:rounded-l-full={open}
  class:-translate-x-full={open}
  class:left-0={!open}
  class:left-64={open}
  onclick={() => page.setParam('settings', !page.settings ? 'open' : null)}
  >
  {#if open}
    <Icon icon="mdi:close" class="size-6" />
  {:else}
    <Icon icon="mdi:cog" class="size-6" />
  {/if}
</button>

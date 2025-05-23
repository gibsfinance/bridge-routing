<script lang="ts">
  import Icon from '@iconify/svelte'
  import { page } from '../stores/page.svelte'
  import Button from './Button.svelte'
  import { Accordion, Popover } from '@skeletonlabs/skeleton-svelte'
  import { activeOnboardStep, defaultOnboardTokens, embedSettings, onboardShowOnramps, showGuide } from '../stores/storage.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { tokens } from '../stores/custom-tokens.svelte'
  import { bridgableTokens, bridgeableTokensUnder } from '../stores/input.svelte'
  import { Provider } from '../stores/auth/types'
  import { zeroAddress, type Hex } from 'viem'
    import ModalWrapper from './ModalWrapper.svelte'
    import SelectButtonContents from './SelectButtonContents.svelte'
    import _ from 'lodash'
  // let realPageState = $state(page.value)
  // $effect(() => {
  //   if (embedSettings.value?.open) return
  //   realPageState = page.value
  // })
  $effect(() => {
    if (embedSettings.value?.open) return
    if (page.onramps === 'show' && onboardShowOnramps.value) return
    if (page.onramps === 'closed' && !onboardShowOnramps.value) return
    page.setParam('onramps', onboardShowOnramps.value ? 'show' : 'closed')
  })
  $effect(() => {
    if (embedSettings.value?.open) return
    if (page.guide === 'show' && showGuide.value) return
    if (page.guide === 'closed' && !showGuide.value) return
    page.setParam('guide', showGuide.value ? 'show' : 'closed')
  })
  const copyCurrentUrl = $derived(() => {
    navigator.clipboard.writeText(page.url.toString())
  })
  const openCurrentUrl = $derived(() => {
    window.open(page.url.toString(), '_blank')
  })
  const focused = $derived(embedSettings.value?.focused)
  const open = $derived(embedSettings.value?.open)
  const value = $derived(focused ? [focused] : [])
  // reset settings
  type PageState = {
    mode?: string | null
    guide?: string | null
    onramps?: string | null
    bridgeTokenIn?: Hex
    pulsexTokenOut?: Hex
  }
  let previousPageState = $state<PageState>({})
  const pageState: PageState = $derived({
    mode: page.mode,
    guide: page.guide,
    onramps: page.onramps,
    bridgeTokenIn: defaultOnboardTokens.value?.bridgeTokenIn ?? zeroAddress,
    pulsexTokenOut: defaultOnboardTokens.value?.pulsexTokenOut ?? zeroAddress,
  })
  $effect(() => {
    page.locked = !!embedSettings.value?.open
  })
  $effect(() => {
    if (embedSettings.value?.open) return
    previousPageState = pageState
  })
  const resetDisabled = $derived(_.isEqual(pageState, previousPageState))
  const revertPageState = $derived(() => {
    page.setParam('mode', previousPageState.mode ?? null)
    page.setParam('guide', previousPageState.guide ?? null)
    page.setParam('onramps', previousPageState.onramps ?? null)
    page.setParam('bridgeTokenIn', previousPageState.bridgeTokenIn ?? null)
    page.setParam('pulsexTokenOut', previousPageState.pulsexTokenOut ?? null)
    defaultOnboardTokens.extend({ bridgeTokenIn: previousPageState.bridgeTokenIn, pulsexTokenOut: previousPageState.pulsexTokenOut })
  })
  // mode settings
  const embedOptions = [
    {
      name: 'Default',
      value: null,
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
      name: 'Default (Show First)',
      value: null,
    },
    {
      name: 'Show',
      value: 'show',
    },
    {
      name: 'Closed',
      value: 'closed',
    },
  ]
  const guideOption = $derived(guideOptions.find(option => option.value === page.guide)!)
  // onboard settings
  const onrampsOptions = [
    {
      name: 'Default',
      value: null,
    },
    {
      name: 'Show',
      value: 'show',
    },
    {
      name: 'Closed',
      value: 'closed',
    },
  ]
  const onrampsOption = $derived(onrampsOptions.find(option => option.value === page.onramps)!)
  // stage
  const stageOptions = [
    {
      name: 'Onboard',
      value: 'onboard',
    },
    {
      name: "Swap",
      value: 'swap',
    },
  ]
  const stageOption = $derived(stageOptions.find(option => option.value === page.stage) ?? stageOptions[0])
  const stageOptionInt = $derived(stageOption.value === 'onboard' ? 1 : 2)
  // bridge token in
  const bridgeTokenInFromSettings = $derived(defaultOnboardTokens.value?.bridgeTokenIn ?? zeroAddress)
  let bridgeTokenIn = $state(defaultOnboardTokens.value?.bridgeTokenIn ?? zeroAddress)
  $effect(() => {
    if (bridgeTokenIn && bridgeTokenIn !== bridgeTokenInFromSettings) {
      bridgeTokenIn = bridgeTokenInFromSettings
    }
  })
  // pulsex token out
  const pulsexTokenOutFromSettings = $derived(defaultOnboardTokens.value?.pulsexTokenOut ?? zeroAddress)
  let pulsexTokenOut = $state(defaultOnboardTokens.value?.pulsexTokenOut ?? zeroAddress)
  $effect(() => {
    if (pulsexTokenOut && pulsexTokenOut !== pulsexTokenOutFromSettings) {
      pulsexTokenOut = pulsexTokenOutFromSettings
    }
  })
</script>

<button class="flex fixed bottom-16 z-20 size-8 items-center justify-center border border-gray-200 bg-gray-50 hover:bg-gray-100 text-surface-contrast-50 transition-all duration-200"
  type="button"
  class:rounded-r-full={!open}
  class:rounded-l-full={open}
  class:left-0={!open}
  class:left-64={open}
  class:-translate-x-full={open}
  onclick={() => embedSettings.extend({ open: !open })}
  >
  {#if open}
    <Icon icon="mdi:close" class="size-6" />
  {:else}
    <Icon icon="mdi:cog" class="size-6" />
  {/if}
</button>
<div class="w-0 transition-all duration-200 relative flex flex-col sticky top-0" class:w-64={open}>
  <div class="flex flex-col h-screen bg-white top-0 right-0 w-64 sticky">
    <h2 class="text-2xl font-bold font-italiana py-2.5 px-4 text-surface-contrast-50 border-b border-gray-200">Embed Settings</h2>
    <div class="flex flex-col gap-2 text-surface-contrast-50 grow overflow-y-auto">
      <Accordion value={value} collapsible onValueChange={(e) => {
        embedSettings.extend({ focused: e.value[0] ?? null })
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
                      showGuide.value = option.value === 'show'
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
                      onboardShowOnramps.value = option.value === 'show'
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
                      activeOnboardStep.value = option.value === 'onboard' ? 1 : 2
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
        <hr class="hr" />
        <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="bridgeTokenIn" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="streamline:coin-share" />{/snippet}
          {#snippet control()}Bridge Token In{/snippet}
          {#snippet panel()}
            {@const tokens = bridgableTokens.bridgeableTokensUnder({
              provider: Provider.PULSECHAIN,
              chain: 1,
              partnerChain: 369,
            })}
            {@const token = tokens.find(token => token.address === bridgeTokenIn)!}
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
                    tokens={tokens}
                    chains={[1]}
                    selectedChain={1}
                    selectedToken={token}
                    onsubmit={(token) => {
                      const tokenInAddress = token?.address as Hex
                      defaultOnboardTokens.extend({ bridgeTokenIn: tokenInAddress })
                      page.setParam('bridgeTokenIn', tokenInAddress)
                      close()
                    }}
                  />
                {/snippet}
              </ModalWrapper>
            </div>
          {/snippet}
        </Accordion.Item>
        <hr class="hr" />
        <Accordion.Item panelPadding="p-2" controlPadding="px-2 py-3" value="pulsexTokenOut" controlClasses="hover:bg-gray-100 hover:text-surface-contrast-50" leadClasses="mr-2">
          {#snippet lead()}<Icon icon="ri:swap-3-line" />{/snippet}
          {#snippet control()}PulseX Token Out{/snippet}
          {#snippet panel()}
            {@const tokens = bridgableTokens.bridgeableTokensUnder({
              provider: Provider.PULSECHAIN,
              chain: 369,
              partnerChain: 1,
            })}
            {@const token = tokens.find(token => token.address === pulsexTokenOut)!}
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
                    tokens={tokens}
                    chains={[369]}
                    selectedChain={369}
                    selectedToken={token}
                    onsubmit={(token) => {
                      const tokenInAddress = token?.address as Hex
                      defaultOnboardTokens.extend({ pulsexTokenOut: tokenInAddress })
                      page.setParam('pulsexTokenOut', tokenInAddress)
                      close()
                    }}
                  />
                {/snippet}
              </ModalWrapper>
            </div>
          {/snippet}
        </Accordion.Item>
      </Accordion>
    </div>
    <div class="grid grid-cols-3 gap-1 h-14 w-full p-2 sticky bottom-0 bg-white border-t border-gray-200">
      <Button class="flex grow flex-row items-center gap-2 text-surface-contrast-50 justify-center border rounded-lg hover:bg-gray-100 transition-all transition-duration-100 h-10 {resetDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}"
        disabled={resetDisabled}
        onclick={revertPageState}>
        <Icon icon="grommet-icons:revert" class="size-6" />
      </Button>
      <Button class="flex grow flex-row items-center gap-2 text-surface-contrast-50 justify-center border rounded-lg hover:bg-gray-100 transition-all transition-duration-100 h-10" onclick={copyCurrentUrl}>
        <Icon icon="mdi:content-copy" class="size-6" />
      </Button>
      <Button class="flex grow flex-row items-center gap-2 text-surface-contrast-50 justify-center border rounded-lg hover:bg-gray-100 transition-all transition-duration-100 h-10" onclick={openCurrentUrl}>
        <Icon icon="majesticons:open" class="size-6" />
      </Button>
    </div>
  </div>
</div>

<script lang="ts">
  import * as transactions from '$lib/stores/transactions'
  import type { Token } from '$lib/types.svelte'
  import { isHex, zeroAddress, type Hex } from 'viem'
  import { Chains, idToChain, Provider } from '$lib/stores/auth/types'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import {
    assetOutKey,
    assetSources,
    bridgeSettings,
    oneEther,
    searchKnownAddresses,
  } from '$lib/stores/bridge-settings.svelte'
  import {
    assetLink,
    loadAssetLink,
    minAmount,
    liveBridgeStatus,
    bridgeStatuses,
    type ContinuedLiveBridgeStatusParams,
    latestBlock,
  } from '$lib/stores/chain-events.svelte'
  import {
    amountIn,
    bridgableTokens,
    loadFeeFor,
    recipient,
    bridgeKey,
  } from '$lib/stores/input.svelte'
  import { settings as bridgeAdminSettings, settingKey } from '$lib/stores/fee-manager.svelte'
  import { bridgeTx, foreignBridgeInputs, showTooltips } from '$lib/stores/storage.svelte'
  import InputOutputForm from './InputOutputForm.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import OnboardButton from './OnboardButton.svelte'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
  import Icon from '@iconify/svelte'
  import Button from './Button.svelte'
  import OnboardRadio from './OnboardRadio.svelte'
  import GuideShield from './GuideShield.svelte'
  import GuideStep from './GuideStep.svelte'
  import BridgeProgress from './BridgeProgress.svelte'
    import BridgeProgressTxInputToggle from './BridgeProgressTxInputToggle.svelte'

  const toast = getContext('toast') as ToastContext

  const tokenInput = $derived(bridgeSettings.assetIn.value)
  const bridgedTokenKey = $derived(
    assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: tokenInput?.address as Hex,
      unwrap: false,
    }),
  )
  const bridgedToken = $derived(
    !bridgedTokenKey ? null : (bridgeSettings.assetOuts.get(bridgedTokenKey) as Token | null),
  )
  const bridgeAmount = $derived(amountIn.value ?? 0n)
  const bridgeFeePercent = $derived(
    bridgeAdminSettings.get(settingKey(bridgeKey.value))?.feeF2H ?? 0n,
  )
  const bridgeFeeAmount = $derived((bridgeFeePercent * bridgeAmount) / oneEther)
  const outputAmount = $derived(bridgeAmount - bridgeFeeAmount)
  $effect.pre(() => {
    if (tokenInput || bridgeKey.fromChain !== Chains.ETH) return
    bridgeSettings.assetIn.value = {
      address: zeroAddress,
      chainId: Number(bridgeKey.fromChain),
      decimals: 18,
      logoURI: assetSources(tokenInput),
      symbol: 'ETH',
      name: 'Ether',
    }
  })

  $effect(() => {
    const assetOutputKey = assetOutKey({
      bridgeKeyPath: bridgeKey.path,
      assetInAddress: tokenInput?.address as Hex,
      unwrap: false,
    })
    if (!tokenInput || !assetOutputKey) return
    const tokensUnderBridgeKey = bridgableTokens.bridgeableTokensUnder({
      provider: Provider.PULSECHAIN,
      chain: Number(bridgeKey.toChain),
      partnerChain: Number(bridgeKey.fromChain),
    })
    const link = loadAssetLink({
      bridgeKey: bridgeKey.value,
      assetIn: tokenInput,
    })
    link.promise.then((l) => {
      if (link.controller.signal.aborted || !l?.assetOutAddress) return
      // reverse the chains here because we are looking for the destination
      let assetOut = searchKnownAddresses({
        tokensUnderBridgeKey,
        address: l?.assetOutAddress,
        customTokens: [],
      })
      assetLink.value = l
      if (!assetOut) return
      bridgeSettings.setAssetOut(assetOutputKey, {
        ...assetOut,
        logoURI: tokenInput.logoURI,
      })
    })
    return link.cleanup
  })
  $effect(() => {
    const pathway = bridgeKey.pathway
    if (!pathway) return
    const result = loadFeeFor({
      value: bridgeKey.value,
      pathway,
      fromChain: Number(bridgeKey.fromChain),
      toChain: Number(bridgeKey.toChain),
    })
    return result.cleanup
  })
  $effect(() => {
    recipient.value = accountState.address ?? zeroAddress
  })
  // let tx: Hex | null = $state(null)
  // $effect(() => {
  //   tx = bridgeTx.value.
  // })
  const incrementApproval = transactionButtonPress({
    toast,
    steps: [
      async () => {
        if (!accountState.address) return
        return await transactions.checkAndRaiseApproval({
          token: tokenInput!.address! as Hex,
          spender: bridgeSettings.bridgePathway!.from!,
          chainId: Number(bridgeKey.fromChain),
          minimum: bridgeAmount,
        })
      },
    ],
  })
  const initiateBridge = transactionButtonPress({
    toast,
    steps: [
      async () => {
        const tx = await transactions.sendTransaction({
          account: accountState.address,
          chainId: Number(bridgeKey.fromChain),
          ...bridgeSettings.transactionInputs,
        })
        bridgeTx.extend({
          hash: tx,
        })
        return tx
      },
    ],
  })
  const bridgeTokens = () => {
    if (needsApproval) return incrementApproval()
    return initiateBridge()
  }
  const needsApproval = $derived.by(() => {
    return (
      assetLink.value?.originationChainId === bridgeKey.fromChain ||
      !bridgeSettings.approval.value ||
      bridgeSettings.approval.value < bridgeSettings.amountToBridge
    )
  })
  // $inspect(
  //   needsApproval,
  //   assetLink.value?.originationChainId,
  //   bridgeSettings.approval.value,
  //   bridgeSettings.amountToBridge,
  // )
  // let usdMultiplier = $state(0n)
  // const wplsTokenPrice = new SvelteMap<string, bigint>()
  // const key = $derived(`${bridgeKey.toChain}-${bridgedToken?.address}`.toLowerCase())
  // const destinationBlock = $derived(latestBlock.block(Number(bridgeKey.toChain)))
  // $effect(() => {
  //   if (!destinationBlock) return
  //   const watcher = watchWplsUSDPrice(destinationBlock)
  //   watcher.promise.then((price) => {
  //     if (watcher.controller.signal.aborted) return
  //     usdMultiplier = price ?? 0n
  //   })
  //   return watcher.cleanup
  // })
  // const priceAsInt = $derived(wplsTokenPrice.get(key) ?? 0n)
  // const usdValueInt = $derived(
  //   priceAsInt && usdMultiplier ? ((priceAsInt ?? 0n) * oneEther) / usdMultiplier : 0n,
  // )
  // const usdValueTokenAmount = $derived(
  //   !amountIn.value
  //     ? 0n
  //     : (usdValueInt * amountIn.value) / 10n ** BigInt(tokenInput?.decimals ?? 18),
  // )
  let maxBridgeable = $state(0n as bigint | null)
  const disableBridgeButton = $derived(
    !maxBridgeable ||
      !amountIn.value ||
      !minAmount.value ||
      amountIn.value < minAmount.value ||
      amountIn.value > maxBridgeable,
  )
  // $inspect(disableBridgeButton, maxBridgeable, amountIn.value, minAmount.value)
  // const toggleEditTxHash = () => {
  //   showTxInput = !showTxInput
  // }
</script>

<InputOutputForm icon="line-md:chevron-double-down">
  {#snippet input()}
    <SectionInput
      focused
      label="Input"
      token={tokenInput}
      value={amountIn.value}
      onbalanceupdate={(balance) => {
        maxBridgeable = balance
      }}
      onmax={(balance) => {
        amountIn.value = balance
      }}
      oninput={(v) => {
        amountIn.value = v
      }}>
      {#snippet radio()}
        <OnboardRadio />
      {/snippet}
      {#snippet modal({ close })}
        <TokenSelect
          chains={[Number(Chains.ETH)]}
          selectedChain={Number(bridgeKey.fromChain)}
          tokens={bridgableTokens.bridgeableTokensUnder({
            provider: Provider.PULSECHAIN,
            chain: Number(bridgeKey.fromChain),
            partnerChain: Number(bridgeKey.toChain),
          })}
          onsubmit={(tkn) => {
            if (tkn) {
              bridgeSettings.assetIn.value = tkn as Token
              foreignBridgeInputs.value = {
                ...foreignBridgeInputs.value!,
                toToken: tkn.address,
              }
            }
            close()
          }} />
      {/snippet}
    </SectionInput>
  {/snippet}
  {#snippet output()}
    <SectionInput
      label="Output"
      token={bridgedToken}
      readonlyInput
      readonlyTokenSelect
      value={outputAmount}
      onbalanceupdate={() => {}}>
      {#snippet underinput()}
        <BridgeProgressTxInputToggle />
      {/snippet}
    </SectionInput>
  {/snippet}
  {#snippet button()}
    <OnboardButton
      disabled={disableBridgeButton}
      requiredChain={tokenInput?.chainId ? idToChain.get(tokenInput!.chainId) : null}
      onclick={bridgeTokens}
      text={needsApproval ? 'Approve' : 'Bridge to PulseChain'}
      loadingKey="lifi-quote" />
  {/snippet}
  {#snippet progress()}
    <BridgeProgress />
    <!-- {#if showTxInput}
      <div class="h-6 w-full relative">
        <Button
          onclick={hideTxHashInput}
          class="text-sm text-contrast-500 text-right absolute top-0 leading-6 flex flex-col gap-1 items-center justify-center size-6 text-surface-contrast-50">
          <Icon icon="flowbite:close-outline" class="size-4 flex [&>path]:stroke-2" />
        </Button>
        <Input
          value={txHashValue}
          oninput={(val) => {
            updateTxHash(val)
            if (isHex(val) && val.length === 66) {
              showTxInput = false
            }
          }}
          class="border pl-6 pr-2 py-1 rounded-full text-xs h-full text-ellipsis text-surface-contrast-50 text-right focus:ring-0 {isValidTxHash
            ? 'border-success-500'
            : 'border-error-200'}" />
      </div>
    {:else if bridgeStatus}
      <div class="flex flex-row w-full relative grow">
        <Progress
          height="h-6"
          meterBg="bg-success-500"
          trackClasses="flex rounded-full overflow-hidden inset-shadow-sm border border-success-500"
          value={percentProgress ?? 30}
          max={100} />
        <span
          class="text-sm text-contrast-500 text-right absolute top-0 leading-6 -translate-x-full flex flex-row gap-1 items-center px-2"
          style:left={`${percentProgress}%`}>
          <ExplorerLink
            path={`/tx/${bridgeStatus?.hash}`}
            chain={Number(bridgeKey.fromChain)}
            class="size-6 flex" />
          <span>{bridgeStatus?.status}</span>
          {#if bridgeStatus?.status === bridgeStatuses.AFFIRMED}
            <ExplorerLink
              path={`/tx/${bridgeStatus?.hash}`}
              chain={Number(bridgeKey.toChain)}
              class="size-6 flex" />
          {:else}
            <Tooltip
              interactive={false}
              triggerClasses="flex"
              contentClasses="flex bg-tertiary-500 rounded-lg px-2 py-1"
              openDelay={0}
              closeDelay={0}
              positioning={{ placement: 'top' }}>
              {#snippet trigger()}
                <Icon icon="mdi:clock" class="size-4 flex" />
              {/snippet}
              {#snippet content()}
                <span>{bridgeStatusETATooltip}</span>
              {/snippet}
            </Tooltip>
          {/if}
        </span>
        <Button
          onclick={clearTxTracking}
          class="text-sm text-contrast-500 text-right absolute top-0 leading-6 flex flex-row gap-1 items-center size-6 px-1 py-0.5">
          <Icon icon="mdi:close" class="size-5 flex" />
        </Button>
      </div>
    {/if} -->
  {/snippet}
</InputOutputForm>

{#if showTooltips.value}
  <div class="absolute top-0 left-0 w-full h-full">
    <GuideShield show={true} />
    <GuideStep step={1} triggerClass="absolute top-9 right-5">
      <p>Select the token you wish to bridge to Pulsechain.</p>
    </GuideStep>
    <GuideStep step={2} triggerClass="absolute top-24 left-5">
      <p>Set an amount to bridge.</p>
    </GuideStep>
    <GuideStep step={3} triggerClass="absolute left-0 right-0 mx-auto bottom-5">
      <p>Initiate the bridge.</p>
    </GuideStep>
  </div>
{/if}

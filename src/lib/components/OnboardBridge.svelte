<script lang="ts">
  import * as transactions from '$lib/stores/transactions'
  import type { Token } from '$lib/types.svelte'
  import { zeroAddress, type Hex } from 'viem'
  import { Chains, idToChain, Provider } from '$lib/stores/auth/types'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import {
    assetOutKey,
    assetSources,
    bridgeSettings,
    oneEther,
    searchKnownAddresses,
  } from '$lib/stores/bridge-settings.svelte'
  import { assetLink, loadAssetLink, minAmount } from '$lib/stores/chain-events.svelte'
  import {
    amountIn,
    bridgableTokens,
    loadFeeFor,
    recipient,
    bridgeKey,
  } from '$lib/stores/input.svelte'
  import { settings as bridgeAdminSettings, settingKey } from '$lib/stores/fee-manager.svelte'
  import { bridgeTx, showTooltips } from '$lib/stores/storage.svelte'
  import InputOutputForm from './InputOutputForm.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import OnboardButton from './OnboardButton.svelte'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
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
  let maxBridgeable = $state(0n as bigint | null)
  const disableBridgeButton = $derived(
    !maxBridgeable ||
      !amountIn.value ||
      !minAmount.value ||
      amountIn.value < minAmount.value ||
      amountIn.value > maxBridgeable,
  )
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
          selectedToken={tokenInput}
          tokens={bridgableTokens.bridgeableTokensUnder({
            provider: Provider.PULSECHAIN,
            chain: Number(bridgeKey.fromChain),
            partnerChain: Number(bridgeKey.toChain),
          })}
          onsubmit={(tkn) => {
            if (tkn) {
              bridgeSettings.assetIn.value = tkn as Token
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
      <p>Initiate the bridge to PulseChain.</p>
    </GuideStep>
  </div>
{/if}

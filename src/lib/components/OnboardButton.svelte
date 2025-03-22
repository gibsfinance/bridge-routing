<script lang="ts">
  import Icon from '@iconify/svelte'
  import Button from './Button.svelte'
  import Loading from './Loading.svelte'
  import { activeOnboardStep } from '$lib/stores/storage.svelte'
  import { accountState, connect, switchNetwork } from '$lib/stores/auth/AuthProvider.svelte'
  import type { AppKitNetwork } from '@reown/appkit/networks'
  import { loading } from '$lib/stores/loading.svelte'

  type Props = {
    disabled: boolean
    onclick: () => void
    text: string
    loadingKey: string
    requiredChain?: {
      id: number | string
      name: string
    } | null
  }
  const {
    disabled: disabledMain,
    onclick: onClickMain,
    text: textMain,
    loadingKey,
    requiredChain,
  }: Props = $props()
  const isRequiredChain = $derived(!!requiredChain && requiredChain.id === accountState.chainId)
  const incrementOnboardStep = () => {
    activeOnboardStep.value += 1
  }
  const decrementOnboardStep = () => {
    activeOnboardStep.value -= 1
  }
  const disabled = $derived.by(() => {
    if (!accountState.connected) {
      return false
    }
    if (!isRequiredChain) {
      return false
    }
    return disabledMain || !loading.isResolved(loadingKey)
  })
  const text = $derived.by(() => {
    if (!accountState.connected) {
      return 'Connect Wallet'
    }
    if (!requiredChain) {
      return 'Switch Network'
    }
    if (!isRequiredChain) {
      return 'Switch to ' + requiredChain.name
    }
    return textMain
  })
  const onclick = $derived(
    loading.loadsAfterTick(loadingKey, () => {
      if (!accountState.connected) {
        return connect()
      }
      if (!isRequiredChain) {
        return switchNetwork(requiredChain as AppKitNetwork)
      }
      return onClickMain()
    }),
  )
</script>

<div class="flex flex-row rounded-2xl overflow-hidden">
  <Button
    class="w-14 bg-tertiary-500 text-surface-contrast-950 group flex items-center justify-center"
    onclick={decrementOnboardStep}
    disabled={activeOnboardStep.value === 1}>
    <Icon
      icon="line-md:chevron-double-left"
      class="size-7 transition-transform duration-100 {activeOnboardStep.value !== 1
        ? 'group-hover:-translate-x-0.5'
        : ''}" />
  </Button>
  <Button
    {disabled}
    class="bg-tertiary-500 text-surface-contrast-950 h-14 grow text-xl flex flex-row items-center justify-center shrink-0 gap-2"
    {onclick}>
    <div class="size-6"></div>
    {text}
    <div class="size-6">
      <Loading key={loadingKey} class="size-6" />
    </div>
  </Button>
  <Button
    class="w-14 bg-tertiary-500 text-surface-contrast-950 group flex items-center justify-center"
    onclick={incrementOnboardStep}
    disabled={activeOnboardStep.value === 3}>
    <Icon
      icon="line-md:chevron-double-right"
      class="size-7 transition-transform duration-100 {activeOnboardStep.value !== 3
        ? 'group-hover:translate-x-0.5'
        : ''}" />
  </Button>
</div>

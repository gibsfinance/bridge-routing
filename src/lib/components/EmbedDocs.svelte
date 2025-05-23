<script lang="ts">
    import Icon from "@iconify/svelte"
    import Toggle from "./Toggle.svelte"
    import OnboardGuide from "./OnboardGuide.svelte"

  const tokens = {
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
    bridgedDai: '0xefD766cCb38EaF1dfd701853BFCe31359239F305',
    pump: '0xec4252e62C6dE3D655cA9Ce3AfC12E553ebBA274',
  }
  const permutations = [
    {
      key: 'baseline',
      image: 'baseline',
      name: 'Baseline',
      description: 'A baseline configuration that includes all the essential features and components.',
      active: (urlParams: URLSearchParams) => urlParams.get('mode') === 'embed',
      add: (urlParams: URLSearchParams) => urlParams.set('mode', 'embed'),
      remove: (urlParams: URLSearchParams) => urlParams.delete('mode'),
    },
    {
      key: 'simple',
      image: 'baseline',
      name: "Simple",
      description: 'A simple configuration that includes the essential features and components.',
      active: (urlParams: URLSearchParams) => urlParams.get('mode') === 'simple',
      add: (urlParams: URLSearchParams) => urlParams.set('mode', 'simple'),
      remove: (urlParams: URLSearchParams) => urlParams.delete('mode'),
    },
    {
      key: 'onramps',
      image: 'baseline',
      name: "Onramps",
      description: 'Opens the onramps dropdown for the user to select from.',
      active: (urlParams: URLSearchParams) => urlParams.get('onramps') === 'open',
      add: (urlParams: URLSearchParams) => urlParams.set('onramps', 'open'),
      remove: (urlParams: URLSearchParams) => urlParams.delete('onramps'),
    },
    {
      key: 'guide',
      image: 'baseline',
      name: "Guide",
      description: 'Opens the guide for the user to read. First load is open by default.',
      active: (urlParams: URLSearchParams) => urlParams.get('guide') === 'open',
      add: (urlParams: URLSearchParams) => urlParams.set('guide', 'open'),
      remove: (urlParams: URLSearchParams) => urlParams.delete('guide'),
    },
    {
      key: 'hide-guide',
      image: 'baseline',
      name: "Hide Guide",
      description: 'Opens the guide for the user to read.',
      active: (urlParams: URLSearchParams) => urlParams.get('guide') === 'closed',
      add: (urlParams: URLSearchParams) => urlParams.set('guide', 'closed'),
      remove: (urlParams: URLSearchParams) => urlParams.delete('guide'),
    },
    {
      key: 'onboard-stage',
      image: 'baseline',
      name: "Onboard Stage",
      description: 'Sets the stage of the onboarding process.',
      active: (urlParams: URLSearchParams) => urlParams.get('stage') === 'onboard',
      add: (urlParams: URLSearchParams) => urlParams.set('stage', 'onboard'),
      remove: (urlParams: URLSearchParams) => urlParams.delete('stage'),
    },
    {
      key: 'pulsex-stage',
      image: 'pulsex-focus',
      name: "PulseX Stage",
      description: 'Sets the stage of the PulseX process.',
      active: (urlParams: URLSearchParams) => urlParams.get('stage') === 'pulsex',
      add: (urlParams: URLSearchParams) => urlParams.set('stage', 'pulsex'),
      remove: (urlParams: URLSearchParams) => urlParams.delete('stage'),
    },
    {
      key: 'bridge-token-in',
      image: 'input-token-dai',
      name: "Bridge Token In",
      description: 'Sets the bridge token in.',
      active: (urlParams: URLSearchParams) => urlParams.get('bridgeTokenIn') === tokens.weth,
      add: (urlParams: URLSearchParams) => urlParams.set('bridgeTokenIn', tokens.weth),
      remove: (urlParams: URLSearchParams) => urlParams.delete('bridgeTokenIn'),
    },
    {
      key: 'pulsex-token-out',
      image: 'dai-pump-on-pulsex-focus',
      name: "PulseX Token Out",
      description: 'Sets the pulsex token in.',
      active: (urlParams: URLSearchParams) => urlParams.get('pulsexTokenOut') === tokens.pump,
      add: (urlParams: URLSearchParams) => urlParams.set('pulsexTokenOut', tokens.pump),
      remove: (urlParams: URLSearchParams) => urlParams.delete('pulsexTokenOut'),
    }
  ]
  let currentPermutation = $state(permutations[0])
  let urlParams = $state(new URLSearchParams('mode=embed'))
  const cutOffTop = $derived.by(() => {
    return permutations.find(p => p.key === 'simple')!.active(urlParams)
  })
  const onrampsOpen = $derived.by(() => {
    return permutations.find(p => p.key === 'onramps')!.active(urlParams)
  })
  const guideOpen = $derived.by(() => {
    return permutations.find(p => p.key === 'guide')!.active(urlParams)
  })
  const pulsexStage = $derived.by(() => {
    return permutations.find(p => p.key === 'pulsex-stage')!.active(urlParams)
  })
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }
  const url = $derived(`${location.origin}/#/onboard?${urlParams.toString()}`)
</script>
<div class="bg-gray-50 text-surface-contrast-50 py-8 gap-4 flex flex-col">
  <div class="container mx-auto max-w-6xl text-center">
    <h2 class="text-4xl font-italiana font-bold mb-4">Embed Docs</h2>
    <p class="text-base">Take your favorite onboarding tools with you to any website.</p>
  </div>
  <div class="flex flex-row justify-center items-center gap-2">
    <button class="flex flex-row items-center gap-2 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-50 bg-gray-100 border border-gray-200" onclick={() => copyToClipboard(url)}>
      <Icon icon="mdi:content-copy" />
      <pre class="text-sm">{url}</pre>
    </button>
  </div>
  <div class="flex flex-row justify-center">
    <div class="overflow-hidden w-128 relative" class:h-136={!cutOffTop} class:h-104={cutOffTop}>
      <div class="relative w-full" class:-mt-[130px]={cutOffTop}>
      <img width="512" alt={currentPermutation.name} src="./images/embed/{currentPermutation.image}.png" />
      {#if onrampsOpen || currentPermutation.key === 'onramps'}
        <img alt="Onramp Dropdown" src="./images/embed/onramp-dropdown.png" width="226" class="absolute right-3 bg-white border border-gray-200 overflow-hidden rounded-lg top-43" />
      {/if}
      {#if guideOpen || currentPermutation.key === 'guide'}
        <div class="absolute left-0 w-full bottom-0 z-10 top-[130px] rounded-3xl overflow-hidden">
          <OnboardGuide bridgingToPulsechain={!pulsexStage} />
        </div>
      {/if}
      </div>
    </div>
    <ul class="flex flex-col">
      {#each permutations as permutation}
        <li class="flex flex-row items-center gap-2">
          <button class="flex flex-row items-center gap-2 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 w-full"
          onmouseenter={() => {
            currentPermutation = permutation
          }}
          onclick={() => {
            if (permutation.active(urlParams)) {
              permutation.remove(urlParams)
            } else {
              permutation.add(urlParams)
            }
            urlParams = new URLSearchParams(urlParams)
          }}>
            <Toggle checked={permutation.active(urlParams)} />
            {permutation.name}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>

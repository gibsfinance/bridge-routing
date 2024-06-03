<script lang="ts">
  import BluryImage from '$lib/components/BluryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
  import Info from '$lib/components/Info.svelte'
  import bridgeImage from '$lib/images/bridge.jpeg'
  import TokenDirectionDropdown from '$lib/components/TokenDirectionDropdown.svelte'
  import Version from '$lib/components/Version.svelte'
  import Icon from '@iconify/svelte'
</script>

<BluryImage height="300px" image_url={bridgeImage}>
  <h1
    class="text-white font-italiana z-10 absolute top-0 bottom-0 left-0 right-0 m-auto text-center text-8xl content-center capitalize">
    token delivery
  </h1>
</BluryImage>

<div class="container m-auto max-w-lg flex flex-col">
  <TokenDirectionDropdown />
  <Bridge />
  <div class="flex flex-row mb-8 leading-8 text-slate-400 md:px-0 px-4">
    <span class="flex hover:text-slate-500">
      <Info />
    </span>
    <span class="flex flex-grow justify-center">
      <span class="hover:text-slate-500 items-center flex flex-row text-sm" style="line-height: 32px">
        <Icon icon="mdi:clock-outline" height="1.5em" width="1.5em" />
        <span class="mx-1">~30 min</span>
      </span>
    </span>
    <span class="flex hover:text-slate-500 text-sm" style="line-height: 32px">
      <Version />
    </span>
  </div>
</div>

<script lang="ts">
  import Info from './Info.svelte'
  import Icon from '@iconify/svelte'
  import Version from './Version.svelte'
</script>

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

<script lang="ts">
  import Info from './Info.svelte'
  import Version from './Version.svelte'
</script>

<div class="flex flex-row leading-8 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950 p-4 justify-around shadow-inset dark:shadow-none">
  <div class="max-w-5xl flex flex-col sm:flex-row grow container items-center justify-between gap-2 sm:gap-0">
    <div class="flex">
      <Info />
    </div>
    <div class="flex hover:text-slate-500 dark:hover:text-slate-200 text-xs items-center sm:text-sm leading-8">
      <Version />
    </div>
  </div>
</div>

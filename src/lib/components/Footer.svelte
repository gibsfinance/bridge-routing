<script lang="ts">
  import Info from './Info.svelte'
  import Version from './Version.svelte'
</script>

<div class="flex flex-row leading-8 text-slate-200 bg-slate-950 p-4 justify-around">
  <div class="max-w-5xl flex flex-row flex-grow container items-center">
    <div class="flex w-full">
      <div class="flex">
        <Info />
      </div>
    </div>
    <div class="flex hover:text-slate-400 text-xs items-center sm:text-sm leading-8 ">
      <Version />
    </div>
    <!-- <div class="flex w-full"></div> -->
  </div>
</div>

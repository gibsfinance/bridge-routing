<script lang="ts">
  import OnboardRadioItem from './OnboardRadioItem.svelte'
</script>

<div class="relative flex flex-col bg-surface-900-100 rounded-2xl">
  <div class="flex flex-row items-center justify-center relative">
    <OnboardRadioItem step={1} justifyClass="flex items-center justify-end" />
    <OnboardRadioItem step={2} />
    <OnboardRadioItem step={3} justifyClass="flex items-center justify-start" />
  </div>
</div>

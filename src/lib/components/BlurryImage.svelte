<script lang="ts">
  export let image_url = ''
  export let min_height = 'auto'
  export let height = 'auto'
  export let blur = '9px'
  export let size = '1em'
  export let rect = 'inset(0)'
  export let opacity = '1'
  export let brightness = '100%'
  export let containerClassName = ''
  export let bg_color = 'bg-slate-950'
</script>

<div class="h-content relative overflow-hidden w-full">
  <div
    class="img w-full {bg_color}"
    style="--blur: {blur}; --size: {size}; --brightness: {brightness}; --rect: {rect}; --opacity: {opacity}; min-height: {min_height}; height: {height}; background-image: {image_url}">
    <div
      class="relative flex justify-center w-full {containerClassName}"
      style="min-height: {min_height};">
      <slot />
    </div>
  </div>
</div>

<style lang="postcss">
  .img {
    border: solid var(--size) rgba(0, 0, 0, 0.45);
    background-position: 50% center;
    background-size: cover;
    background-origin: border-box;
    background-clip: padding-box;
    position: relative;
    font-size: 2em;
    display: flex;
    @apply flex justify-center;

    &:before {
      position: absolute;
      top: calc(var(--size) * -2);
      right: calc(var(--size) * -2);
      bottom: calc(var(--size) * -2);
      left: calc(var(--size) * -2);
      border: inherit;
      border-color: transparent;
      background: inherit;
      background-clip: border-box;
      opacity: var(--opacity);
      -webkit-filter: blur(var(--blur)) brightness(var(--brightness));
      filter: blur(var(--blur)) brightness(var(--brightness));
      clip: rect(0 100% 100% 0);
      -webkit-clip-path: var(--rect);
      clip-path: var(--rect);
      content: '';
    }
  }
</style>

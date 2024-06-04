<script lang="ts">
  export let image_url = ''
  export let min_height = 'auto'
  export let height = 'auto'
  export let blur = '9px'
  export let size = '1em'
  export let rect = 'inset(0)'
  export let opacity = '1'
  export let brightness = '100%'
</script>

<div class="h-content relative">
  <div
    class="img"
    style="--blur: {blur}; --size: {size}; --brightness: {brightness}; --rect: {rect}; --opacity: {opacity}; min-height: {min_height}; height: {height}; background-image: url({image_url})">
    <div class="z-30 relative flex justify-center w-full">
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
      top: calc(var(--size) * -1);
      right: calc(var(--size) * -1);
      bottom: calc(var(--size) * -1);
      left: calc(var(--size) * -1);
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

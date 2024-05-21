<script lang="ts">
  export let image_url = ''
  export let max_height = '600px'
</script>

<div class="h-content relative">
  <div class="img h-screen" style="max-height: {max_height}; background-image: url({image_url})" />
  <slot />
</div>

<style lang="postcss">
  .img {
    --size: 1.5em;
    --blur: 9px;
    --rect: inset(0);
    border: solid 1.5em rgba(0, 0, 0, 0.45);
    background-position: 50% center;
    background-size: cover;
    background-origin: border-box;
    background-clip: padding-box;
    position: relative;
    font-size: 2em;

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
      -webkit-filter: blur(var(--blur));
      filter: blur(var(--blur));
      clip: rect(0 100% 100% 0);
      -webkit-clip-path: var(--rect);
      clip-path: var(--rect);
      content: '';
    }
  }
</style>

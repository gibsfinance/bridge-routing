<script lang="ts">
  const { image_url = '', min_height = 'auto', height = 'auto', containerClassName = '', children } = $props()
</script>

<div class="relative w-full bg-cover bg-center" style="background-image: {image_url};">
  <div
    class="img w-full backdrop-blur-md"
    style="min-height: {min_height}; height: {height};">
    <div
      class="relative flex justify-center contents-container w-full flex-grow {containerClassName}"
      style="min-height: {min_height};">
      {@render children?.()}
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss/theme";
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
    .contents-container {
      margin-top: calc(var(--size) * -1);
      margin-bottom: calc(var(--size) * -1);
      margin-left: calc(var(--size) * -1);
      margin-right: calc(var(--size) * -1);
      width: calc(100% + var(--size) * 2);
    }

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

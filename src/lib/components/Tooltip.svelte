<script lang="ts">
  export let tooltip = ''
  export let position = 'left'
  export let positionFlow = 'center'
  export let show = false
  export let maxWidth = '380px'
</script>

<div
  style="--tooltip: '{tooltip}'; --max-width: {maxWidth}"
  class="tooltip"
  class:show-tooltip={show}
  class:positioned-left={position === 'left'}
  class:positioned-right={position === 'right'}
  class:positioned-flow-center={positionFlow === 'center'}
  class:positioned-flow-above={positionFlow === 'above'}
  class:positioned-flow-below={positionFlow === 'below'}>
  <slot />
</div>

<style lang="postcss">
  .tooltip {
    @apply absolute transform-none pointer-events-none font-thin z-20 text-center flex opacity-0 transition-all w-max bg-neutral-700 rounded py-1 px-2 text-slate-300 text-[0.875rem] leading-5;
    max-width: var(--max-width);
    .positioned-left& {
      right: 100%;
      top: 50%;
      margin-right: 8px;
      transform: translateY(-50%);
      .positioned-flow-above& {
        right: 0;
        top: auto;
        bottom: 100%;
        margin-bottom: 8px;
        margin-right: 0;
        transform: translateY(0);
      }
    }
    .positioned-right& {
      left: 100%;
      top: 50%;
      margin-left: 5px;
      transform: translateY(-50%);
      .positioned-flow-below& {
        right: auto;
        left: 16px;
        top: 100%;
        margin-right: 0;
        margin-top: 4px;
        margin-left: 0;
        @apply transform-none;
      }
      .positioned-flow-above& {
        left: auto;
        top: auto;
        bottom: 100%;
        @apply transform-none;
      }
    }
    &::after {
      content: '';
      display: flex;
      pointer-events: none;
      height: 0;
      width: 0;
      position: absolute;
      right: 100%;
      @apply border-transparent border-4;
      .positioned-left& {
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        @apply border-l-slate-700;
        .positioned-flow-above& {
          /* bottom: 100%; */
          top: 100%;
          margin-top: 4px;
          /* bottom: 0; */
          right: 10px;
          margin-right: 0;
          /* transform: translateY(-100%); */
          @apply border-t-slate-700 border-l-transparent;
        }
      }
      .positioned-right& {
        left: 100%;
        top: 50%;
        margin-left: -3px;
        transform: translateY(-50%);
        @apply border-r-slate-700;
        .positioned-flow-below& {
          left: 16px;
          top: -4px;
          margin: 0;
          @apply border-b-slate-700 border-r-transparent;
        }
        .positioned-flow-above& {
          top: 100%;
          left: 16px;
          margin-top: 4px;
          margin-left: 0;
          @apply border-t-slate-700 border-r-transparent;
        }
      }
    }
  }
  .show-tooltip {
    opacity: 1;
  }
</style>

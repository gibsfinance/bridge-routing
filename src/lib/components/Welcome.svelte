<script>
  import BlurryImage from './BlurryImage.svelte'
  import { onMount } from 'svelte'
  const payMe = 'images/pay-me.png'
  let toggle = $state(false)
  onMount(() => {
    const id = setTimeout(() => {
      toggle = true
    }, 1000)
    return () => clearTimeout(id)
  })
</script>

<BlurryImage height="600px" image_url="url({payMe})">
  <div
    class="flex flex-col items-center justify-center h-fit gap-4 top-0 bottom-0 left-0 right-0 m-auto">
    <h1
      class="text-white font-italiana z-10 text-center text-8xl content-center flex grow justify-center justify-items-center h-24 transition-all duration-300"
      class:translate-y-8={!toggle}>
      Gibs
    </h1>
    <div class="flex flex-row gap-2 italic font-light">
      <span
        class="transition-all duration-300"
        class:translate-y-full={!toggle}
        class:opacity-0={!toggle}>Convenience.</span>
      <span
        class="transition-all duration-300 delay-700"
        class:translate-y-full={!toggle}
        class:opacity-0={!toggle}>For Pulsechain.</span>
    </div>
  </div>
</BlurryImage>

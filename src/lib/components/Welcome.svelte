<script>
  import BlurryImage from './BlurryImage.svelte'
  const payMe = new URL('/images/pay-me.png', import.meta.url).href
</script>

<BlurryImage height="600px" image_url="url({payMe})">
  <h1
    class="text-white font-italiana z-10 top-0 bottom-0 left-0 right-0 m-auto text-center leading-10 text-8xl content-center flex grow h-fit justify-center justify-items-center">
    Gibs
  </h1>
</BlurryImage>

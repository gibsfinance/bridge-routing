<script>
  import BluryImage from '$lib/components/BluryImage.svelte'
  import Bridge from '$lib/components/Bridge.svelte'
</script>

<BluryImage max_height="300px" image_url="/src/lib/images/bridge.jpeg">
  <h1
    class="text-white font-italiana z-10 absolute top-0 bottom-0 left-0 right-0 m-auto text-center leading-10 text-8xl content-center"
  >
    Bridge
  </h1>
</BluryImage>

<div class="container m-auto max-w-md">
  <Bridge />
</div>

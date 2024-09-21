<script lang="ts">
  let hovering = false
  const handlers = {
    enter: () => {
      hovering = true
    },
    leave: () => {
      hovering = false
    },
  }
</script>

<slot {handlers} {hovering} />

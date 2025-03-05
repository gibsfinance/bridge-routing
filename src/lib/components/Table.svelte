<script lang="ts">
  import { onMount } from 'svelte'

  export let rows: string[] = []
  export let page = 0
  export let totalPages: string[][] = []
  let currentPageRows: string[] = []
  let itemsPerPage = 5
  let loading = true

  const currentPageRows = $derived(totalPages.length > 0 ? totalPages[page] : [])

  const paginate = (items: string[]) => {
    const pages = Math.ceil(items.length / itemsPerPage)

    const paginatedItems = Array.from({ length: pages }, (_, index) => {
      const start = index * itemsPerPage
      return items.slice(start, start + itemsPerPage)
    })

    // console.log('paginatedItems are', paginatedItems)
    totalPages = [...paginatedItems]
  }

  onMount(() => {
    rows = Array.from({ length: 22 }, (_, i) => `item${i}`)
    paginate(rows)
  })

  const setPage = (p: number) => {
    if (p >= 0 && p < totalPages.length) {
      page = p
    }
  }
</script>

<table class="table table-bordered table-striped table-hover">
  <tbody>
    {#each currentPageRows as row, i}
      <tr><td>{row}</td></tr>
    {:else}
      <tr>
        <td colspan={100}>
          <h5 class="text-center">There is no data to display here.</h5>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
<nav class="pagination">
  <ul>
    <li>
      <button type="button" class="btn-next-prev" on:click={() => setPage(page - 1)}>
        First
      </button>
    </li>
    <li>
      <button type="button" class="btn-next-prev" on:click={() => setPage(page - 1)}>&lt;</button>
    </li>

    {#each totalPages as page, i}
      <li>
        <button type="button" class="btn-page-number" on:click={() => setPage(i)}>
          {i + 1}
        </button>
      </li>
    {/each}

    <li>
      <button type="button" class="btn-next-prev" on:click={() => setPage(page + 1)}>&gt;</button>
    </li>
    <li>
      <button type="button" class="btn-next-prev" on:click={() => setPage(page + 1)}>Last</button>
    </li>
  </ul>
</nav>

<style lang="postcss">
  @reference "tailwindcss/theme";
  nav > ul {
    list-style-type: none;
    display: flex;
  }
</style>

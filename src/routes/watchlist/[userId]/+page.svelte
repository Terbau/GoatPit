<script lang="ts">
	import type { PageData } from "./$types";
  import { getUser } from "@lucia-auth/sveltekit/client";
	import Watchlist from "$lib/components/watchlist/Watchlist.svelte";
	import { activeWatchlistUserId, defaultWatchlist } from "$lib/stores/watchlist";
	import WatchlistSidebar from "$lib/components/watchlist/WatchlistSidebar.svelte";
	import { page } from "$app/stores";

  export let data: PageData;

  const watchlistUserId = data.userId;

  $: activeWatchlistUserId.set($page.params.userId);

  const user = getUser();
</script>

<div class="container flex flex-row flex-nowrap mx-auto justify-center gap-x-10 mt-10">
  <WatchlistSidebar userId={data.userId} />
  <Watchlist userId={data.userId} items={defaultWatchlist} />
</div>

<style lang="postcss">
  .container {
    @apply max-w-7xl;
  }
</style>

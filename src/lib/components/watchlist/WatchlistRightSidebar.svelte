<script lang="ts">
	import { browser } from "$app/environment";
	import { addAlert } from "$lib/stores/alert";
	import { activeWatchlistUserId, watchlistItems, prependToWatchlist, watchlistIsLoading, activeWatchlistId } from "$lib/stores/watchlist";
	import { getUser } from "@lucia-auth/sveltekit/client";
	import InfoIcon from "../icons/InfoIcon.svelte";
	import InfoTooltip from "../tooltip/InfoTooltip.svelte";
	import type { WatchlistInfo } from "./Watchlist.svelte";

  export let userId: string;
  export let isDefault: boolean = true;
  export let loading: boolean = false;
  export let watchlistInfo: WatchlistInfo | null;

  let imdbUserId: string | null = 'ur154224160';
  const user = getUser();


  const getWatchlistUserIdFromLink = (link: string): string | null => {
		// pattern /^(?:https:\/\/)?(?:www\.)?imdb\.com\/user\/(.*)\/watchlist(?:\?.*)?$/
		const pattern = /^(?:https:\/\/)?(?:www\.)?imdb\.com\/user\/(.*)\/watchlist(?:\?.*)?$/;
		const match = link.match(pattern);

		return match ? match[1] : null;
	};

	const handleInputChange = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		imdbUserId = getWatchlistUserIdFromLink(value);
	};

	const handleSubmit = async () => {
    if (!browser) return;
		if (!imdbUserId) return;

		const resp = await fetch(`/api/user/${userId}/watchlist/${$activeWatchlistId}/items/import`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ imdbUserId })
		});

		if (resp.ok) {
			if ($activeWatchlistUserId == $user?.id) {
				const respData = await resp.json();
				prependToWatchlist(respData.newItems);
        // watchlistItems.update((items) => [...respData.newItems, ...items])
				addAlert({
					type: 'success',
					message: `Imported IMDb watchlist items`
				});
			}
		}
	};

</script>

<div class="h-fit w-64 shrink-0 mt-4 hidden flex-col lg:flex">
  {#if $watchlistIsLoading || watchlistInfo !== null}
  <!-- {#if $user?.id == userId} -->
  
    <div class="flex flex-row gap-x-2 text-sm items-center mb-4">
      <i class="h-full w-8 stroke-current text-blue-11">
        <InfoIcon />
      </i>
      <p>Click an item to view options</p>
    </div>
  <!-- {/if} -->

    <div class="bg-indigo-6 p-4 shadow-2xl">
      {#if $watchlistIsLoading}
        <div class="flex flex-col gap-y-2">
          <div class="skeleton-bar w-2/3 bg-indigo-3" />
          <div class="skeleton-bar w-2/3 bg-indigo-3" />
        </div>
      {:else}
        <h1 class="font-bold text-lg">
          {watchlistInfo?.name}
          {#if watchlistInfo?.isDefaultWatchlist}
            <span class="text-indigo-11 text-sm font-normal"> (default)</span>
          {/if}
        </h1>
        <p class="text-md">User: {watchlistInfo?.user.email}</p>
      {/if}
    </div>

    {#if $user?.id == userId}
      <form class="flex flex-col mt-8" on:submit|preventDefault={handleSubmit}>
        <!-- <label class="font-bold text-lg" for="">Import from IMDb watchlist</label> -->
        <h2 class="flex flex-row items-center gap-x-1">
          Import items
          <InfoTooltip label="Import items from IMDb watchlist" class="h-6 w-6" />
        </h2>

        <div class="divider my-1" />
        <div class="flex flex-col gap-y-2">
          <input
            type="text"
            placeholder="IMDb watchlist"
            class="input w-full max-w-xs"
            value="https://www.imdb.com/user/ur154224160/watchlist?sort=your_rating%2Cdesc&view=detail"
            on:input={handleInputChange}
          />
          <button class="btn btn-warning {!imdbUserId ? 'btn-disabled bg-yellow-5' : ''}">
            Import
          </button>
        </div>
      </form>
    {/if}
  {/if}
</div>

<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import type { ExtendedWatchlistItem } from '$lib/server/functions';
	import { addAlert } from '$lib/stores/alert';
	import { activeWatchlistUserId, removeFromWatchlist, watchlistItemIsHighlighted } from '$lib/stores/watchlist';
	import { transformImdbImageSize } from '$lib/utils';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import FilledStarIcon from '../icons/FilledStarIcon.svelte';
	import ImdbIcon from '../icons/ImdbIcon.svelte';
	import WatchlistItemEditToolbar from './WatchlistItemEditToolbar.svelte';

	export let item: ExtendedWatchlistItem;
  export let userId = "";

	const imdbItem = item.item;

  const user = getUser();
	let transformActive = false;

  watchlistItemIsHighlighted.subscribe((value) => {
    if (!value) transformActive = value;
  });

  const openFocus = () => {
    transformActive = true;
    watchlistItemIsHighlighted.set(true);
  }

  const closeFocus = () => {
    transformActive = false;
    watchlistItemIsHighlighted.set(false);
  }

	beforeNavigate(() => {
		closeFocus();
	});



  const handleDelete = async () => {
    const itemIds = [item.id]

    const resp = await fetch(`/api/user/${userId}/watchlist/items`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemIds),
    });

    if (resp.status === 200) {
      const respData = await resp.json(); 

      closeFocus();
      removeFromWatchlist(respData.deletedItemIds);
      addAlert({
        message: 'Item deleted from watchlist.',
        type: 'success',
      });
    } else {
      addAlert({
        message: 'Failed to delete item from watchlist.',
        type: 'error',
      });
    }
  }
</script>

<li
	class="relative flex justify-center ease-in-out duration-75 {transformActive
		? 'scale-110 z-30'
		: ''}"
>
  {#if $user?.id == userId}
    <WatchlistItemEditToolbar
      visible={transformActive}
      on:delete={handleDelete}
    />
  {/if}

	<button
		on:click={() => {
			transformActive = !transformActive;
			watchlistItemIsHighlighted.set(transformActive);
		}}
		class="flex flex-row h-48 w-full overflow-hidden rounded-xl bg-indigo-5 group"
	>
		<img
			class="h-48 w-32 object-fill shrink-0"
			src={transformImdbImageSize(imdbItem.imageUrl, 300)}
			loading="lazy"
			alt=""
		/>
		<div class="flex flex-col px-4 py-2 grow box-border text-left h-full">
			<div class="flex flex-row items-center gap-x-1">
				<h2 class="text-indigo-12 text-lg font-bold truncate max-w-[25rem]">
					{imdbItem.title}
				</h2>
				<p class="shrink-0 text-indigo-11 text-sm">({imdbItem.yearReleased})</p>
				<div
					class="shrink-0 flex flex-row w-[2.7rem] items-center h-full fill-yellow-9 gap-x-1 ml-auto"
				>
					<span class="text-yellow-9 text-md font-bold mt-1">{imdbItem.starRating}</span>
					<FilledStarIcon />
				</div>
			</div>

			<p class="text-sm mt-[-0.25rem]">{imdbItem.genres.map((c) => c.name).join(', ')}</p>
			<p class="mt-2">{imdbItem.plot}</p>

      <!-- <div class="mt-auto">
        <p class="text-right text-sm">Click to {transformActive ? 'close' : 'view'} options</p>
      </div> -->
		</div>
	</button>
</li>

<!-- 

<li class="flex flex-row h-48 w-full overflow-hidden rounded-xl bg-indigo-5 group">
  <div class="h-full w-40 relative">
  <img class="h-48 w-32 object-fill shrink-0" src={transformImdbImageSize(imdbItem.imageUrl, 300)} loading="lazy" alt="">
    <img class="h-full w-full" src={imdbItem.imageUrl} loading="lazy" alt="">
    <div class="absolute h-full w-full bg-gradient-to-tl from-transparent via-black/10 
                to-black top-0 left-0">
      <div class="h-6 flex justify-start p-1 fill-yellow-10 text-yellow-10">
        {imdbItem.starRating}
        <FilledStarIcon />
      </div>   
    </div>
  </div>
  <div class="flex flex-col px-4 py-2 grow box-border">
    <div class="flex flex-row items-center gap-x-1">
      <h2 class="text-indigo-12 text-lg font-bold truncate max-w-[25rem]">
        {imdbItem.title}
      </h2>
      <p class="shrink-0 text-indigo-11 text-sm">({imdbItem.yearReleased})</p>
      <div class="shrink-0 flex flex-row w-[2.7rem] items-center h-full fill-yellow-9 gap-x-1 ml-auto">
        <span class="text-yellow-9 text-md font-bold mt-1">{imdbItem.starRating}</span>
        <FilledStarIcon />
      </div>
    </div>

    <p class="text-sm mt-[-0.25rem]">{imdbItem.genres.map((c) => c.name).join(", ")}</p>
    <p class="mt-2">{imdbItem.plot}</p>

    <p class="">Creators: {imdbItem.creators.map((c) => c.name).join(", ")}</p>
    <p class="">Stars: {imdbItem.stars.map((c) => c.name).join(", ")}</p>
    
  </div>
</li> -->
<style lang="postcss">
</style>

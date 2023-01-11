<script lang="ts">
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/stores';
	import type { ExtendedWatchlistItem } from '$lib/server/watchlist/types';
	import { addAlert } from '$lib/stores/alert';
	import {
		activeWatchlistUserId,
		activeWatchlistId,
		isEditingItems,
		removeFromWatchlist,
		selectedItemIds,
		watchlistItemIsHighlighted
	} from '$lib/stores/watchlist';
	import { transformImdbImageSize } from '$lib/utils';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { onDestroy } from 'svelte';
	import FilledStarIcon from '../icons/FilledStarIcon.svelte';
	import ImdbIcon from '../icons/ImdbIcon.svelte';
	import type { EloRatingStats } from './Watchlist.svelte';
	import WatchlistItemEditToolbar from './WatchlistItemEditToolbar.svelte';
	import WatchlistItemStats from './WatchlistItemStats.svelte';

	export let item: ExtendedWatchlistItem;
	export let eloRatingStats: EloRatingStats;
	export let userId = '';
	export let isSelected = false;
	// TODO: Add miniSeries or whatever its called to imdb
	// TODO: Check out letterboxd api
	const imdbItem = item.item;

	const user = getUser();
	let transformActive = false;

	const unsubscribe1 = selectedItemIds.subscribe((value) => {
		isSelected = value.includes(item.id);
	});

	const unsubscribe2 = watchlistItemIsHighlighted.subscribe((value) => {
		if (!value) transformActive = value;
	});

	const openFocus = () => {
		transformActive = true;
		watchlistItemIsHighlighted.set(true);
	};

	const closeFocus = () => {
		transformActive = false;
		watchlistItemIsHighlighted.set(false);
	};

	beforeNavigate(() => {
		closeFocus();
	});

	const handleDelete = async () => {
		if (!browser) return;

		const itemIds = [item.id];

		const resp = await fetch(`/api/user/${userId}/watchlist/${$activeWatchlistId}/items`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(itemIds)
		});

		if (resp.status === 200) {
			const respData = await resp.json();

			closeFocus();
			removeFromWatchlist(respData.deletedItemIds);
			addAlert({
				message: 'Item deleted from watchlist.',
				type: 'success'
			});
		} else {
			addAlert({
				message: 'Failed to delete item from watchlist.',
				type: 'error'
			});
		}
	};

	onDestroy(() => {
		unsubscribe1();
		unsubscribe2();
	});
</script>

<li
	class="relative flex justify-center ease-in-out duration-75
	{transformActive ? 'scale-110 z-30 translate-x-[calc((15%+3px)*-1)]' : ''}"
>
	{#if $user?.id == userId}
		<WatchlistItemEditToolbar visible={transformActive} on:delete={handleDelete} />
	{/if}

	<WatchlistItemStats visible={transformActive} {imdbItem} {eloRatingStats} />

	<button
		on:click={() => {
			if ($isEditingItems) {
				selectedItemIds.update((ids) => {
					if (ids.includes(item.id)) {
						return ids.filter((id) => id !== item.id);
					} else {
						return [...ids, item.id];
					}
				});

				// isSelected = !isSelected;
				return;
			}

			transformActive = !transformActive;
			watchlistItemIsHighlighted.set(transformActive);
		}}
		class="grid h-24 sm:h-48 rounded-xl bg-indigo-6 grid-cols-[4rem_1fr] sm:grid-cols-[8rem_1fr] overflow-hidden
					{$isEditingItems && isSelected ? 'ring-4 ring-solid ring-red-10' : ''}
					{$isEditingItems && !isSelected ? 'hover:ring-4 active:ring-4 ring-solid hover:ring-indigo-11 active:ring-indigo-10' : ''}"
	>
		<img
			class="h-24 sm:h-48 object-fill rounded-l-xl"
			src={transformImdbImageSize(imdbItem.imageUrl, 300)}
			loading="lazy"
			alt=""
		/>
		<div class="flex flex-col px-4 py-2 grow box-border text-left h-full">
			<div class="grid items-center gap-x-1 grid-cols-[minmax(0,max-content)_1fr_2fr]">

				<!-- <div class="flex flex-row items-center gap-x-1"> -->
					<!-- <span title={imdbItem.title} class="tooltip truncate" data-tip={imdbItem.title}> -->
				<h2 title={imdbItem.title} class="text-indigo-12 text-md sm:text-lg font-bold truncate">
					{imdbItem.title}
				</h2>
					<!-- </span> -->
				<p class="text-indigo-11 text-sm mr-auto">({imdbItem.yearReleased})</p>
				<!-- </div> -->

				<div class="flex flex-row h-full items-center gap-x-2 ml-auto shrink-0">
					<div class="tooltip" data-tip="Elo Rating{imdbItem.eloRating !== null ? '' : ' (Not rated)'}">
						<span
							class="text-md font-bold bg-gradient-to-r from-indigo-11 to-blue-11 bg-clip-text text-transparent whitespace-nowrap content:['test']"
						>
							{imdbItem.eloRating !== null ? Math.floor(imdbItem.eloRating) : 'NR'}
						</span>
					</div>
					<div class="tooltip flex flex-row w-fit items-center h-full fill-yellow-9 gap-x-1" data-tip="IMDb Rating">
						<span class="text-yellow-9 text-md font-bold">{imdbItem.starRating.toFixed(1)}</span>
						<!-- <FilledStarIcon /> -->
					</div>
				</div>
				<!-- <div class="shrink-0 flex flex-row items-center h-full ml-auto">
					
				</div> -->
			</div>

			<p class="text-xs sm:text-sm mt-[-0.25rem]">{imdbItem.genres.map((c) => c.name).join(', ')}</p>
			<p class="mt-2 text-sm sm:text-base overflow-hidden text-ellipsis">{imdbItem.plot}</p>

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

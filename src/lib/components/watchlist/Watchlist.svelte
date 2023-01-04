<script lang="ts" context="module">
	export interface WatchlistInfo extends Omit<ExtendedWatchlist, 'items'> {}
	export interface EloRatingStats {
		min: number;
		max: number;
		minR: number;
		maxR: number;
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import type { ExtendedWatchlist, ExtendedWatchlistItem } from '$lib/server/functions';
	import {
		watchlistSortDirection,
		watchlistSortOption,
		watchlistActiveGenres,
		watchlistIsLoading,
		watchlistSearchKeyword,
		isEditingItems,
		selectedItemIds
	} from '$lib/stores/watchlist';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import type { Writable } from 'svelte/store';
	import InfoIcon from '../icons/InfoIcon.svelte';
	import RegularEditIcon from '../icons/RegularEditIcon.svelte';
	import SolidEditIcon from '../icons/SolidEditIcon.svelte';
	import SortSelect, { type SortOption } from '../input/SortSelect.svelte';
	import SkeletonWatchlistItem from './SkeletonWatchlistItem.svelte';
	import WatchlistItem from './WatchlistItem.svelte';
	import WatchlistRightSidebar from './WatchlistRightSidebar.svelte';

	export let items: Writable<ExtendedWatchlistItem[]>;
	export let isDefault = true;
	export let userId = '';

	const user = getUser();
	let loading = true;
	let isNavigateLoading = true;
	let initialHasLoaded = false;
	let watchlistInfo: WatchlistInfo;
	let eloRatingStats: EloRatingStats;

	$: watchlistIsLoading.set(loading && isNavigateLoading);

	items.subscribe((value) => {
		let minER = value[0]?.item.eloRating ?? 0;
		let maxER = value[0]?.item.eloRating ?? 0;
		let minRER = value[0]?.item.requestersEloRating ?? 0;
		let maxRER = value[0]?.item.requestersEloRating ?? 0;

		value.forEach((outerItem) => {
			const item = outerItem.item;
			if (item.eloRating !== null) {
				if (item.eloRating < minER) minER = item.eloRating;
				if (item.eloRating > maxER) maxER = item.eloRating;
			}
			if (item.requestersEloRating !== null) {
				if (item.requestersEloRating < minRER) minRER = item.requestersEloRating;
				if (item.requestersEloRating > maxRER) maxRER = item.requestersEloRating;
			}
		});

		eloRatingStats = {
			min: minER,
			max: maxER,
			minR: minRER,
			maxR: maxRER
		};
	});

	const fetchAndSetItems = async (isNavigate: boolean = false) => {
		if (!browser) return;

		loading = true;
		isNavigateLoading = isNavigate;

		const params = new URLSearchParams();
		params.append('orderBy', $watchlistSortOption);
		params.append('orderDirection', $watchlistSortDirection);

		const resp = await fetch(`http://127.0.0.1:5173/api/user/${userId}/watchlist?` + params);
		const resultData: ExtendedWatchlist = await resp.json();

		items.set(resultData.items);
		watchlistInfo = resultData;
		loading = false;
		isNavigateLoading = false;
		initialHasLoaded = true;
	};

	afterNavigate(() => {
		fetchAndSetItems(true);
		console.log('Navigate');
	});
	// watchlistSortOption.subscribe(fetchAndSetItems);
	// watchlistSortDirection.subscribe(fetchAndSetItems);

	const sortOptions: SortOption[] = [
		{ label: 'Date added', value: 'added' },
		{ label: 'Title', value: 'title', isReversed: true },
		{ label: 'Release date', value: 'releaseDate' },
		{ label: 'Runtime', value: 'runtime' },
		{ label: 'IMDb Rating', value: 'imdbRating' },
		{ label: 'Elo Rating', value: 'eloRating' },
		{ label: 'Your Elo Rating', value: 'requesterEloRating' }
	];

	sortOptions.forEach((option) => {
		if (option.value === $watchlistSortOption) {
			option.selected = true;
		}
	});

	const handleSelect = (e: Event) => {
		const selectedOption = e.target as HTMLSelectElement;
		watchlistSortOption.set(selectedOption.value);
		fetchAndSetItems();
	};

	const handleSortDirectionChange = (e: CustomEvent) => {
		watchlistSortDirection.set(e.detail.sortDirection);
		console.log(e.detail);

		if (!e.detail.wasReversed) fetchAndSetItems();
	};
</script>

<div class="flex flex-row gap-x-10 grow mt-[-1rem]">
	<div class="flex flex-col w-full gap-y-4">
		<div
			class="flex flex-row w-full items-center gap-x-2 {loading || $items.length > 0
				? ''
				: 'invisible'}"
		>
			<div class="flex flex-row h-full gap-x-6 grow {loading ? 'invisible' : ''}">
				<div
					class="tooltip h-full flex items-end {$isEditingItems ? 'tooltip-left' : 'tooltip-left'}"
					data-tip="Edit items"
				>
					<button
						class="h-[2.5rem] w-[2.5rem] ml-2 {$isEditingItems
							? 'fill-indigo-11'
							: 'fill-slate-9'}"
						on:click={() => {
							isEditingItems.update((value) => !value);
						}}
					>
						{#if $isEditingItems}
							<SolidEditIcon />
						{:else}
							<RegularEditIcon />
						{/if}
					</button>
				</div>

				{#if $isEditingItems}
				<div class="dropdown dropdown-hover dropdown-bottom flex">
					<label tabindex="-1" for="" class="translate-y-[0.25rem] rounded-lg px-4 py-3 bg-base-100 hover:bg-base-200 cursor-pointer">Actions</label>
					<ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
						<li>
							<button>Test</button>
						</li>
						<li>
							<button>Test2</button>
						</li>
					</ul>
				</div>

					<div class="flex flex-col gap-y-1">
						<p class="text-sm text-slate-9 whitespace-nowrap">Selected {$selectedItemIds.length} of {$items.length}</p>

						<div class="flex flex-row gap-x-2">
							<input
								type="checkbox"
								class="checkbox checkbox-primary"
								checked={$selectedItemIds.length === $items.length}
								on:change={() => {
									if ($selectedItemIds.length === $items.length) {
										selectedItemIds.set([]);
									} else {
										selectedItemIds.set($items.map((item) => item.id));
									}
								}}
							/>
							<span class="whitespace-nowrap">Select all</span>
						</div>
						
					</div>

					
				{/if}
			</div>

			<!-- {#if loading || $items.length > 0} -->
			<!-- <button class="bordered-button-indigo w-72">
					Import from IMDb
				</button> -->
			<SortSelect
				sortDirection={$watchlistSortDirection}
				options={sortOptions}
				loading={!initialHasLoaded || (loading && isNavigateLoading)}
				on:change={handleSelect}
				on:sortDirectionChange={handleSortDirectionChange}
			/>
			<!-- {/if} -->
		</div>

		{#if loading}
			<!-- <p>Loading...</p> -->

			<ul class="flex flex-col gap-4 grow">
				{#each Array(3) as _, i}
					<SkeletonWatchlistItem />
				{/each}
			</ul>
		{:else if $items.length > 0 && !loading}
			<ul class="flex flex-col gap-4 grow">
				{#each $items as item (item.id)}
					{#if item.item.genres.some( (genre) => [undefined, true].includes($watchlistActiveGenres[genre.name]) ) && item.item.title
							.toLocaleLowerCase()
							.includes($watchlistSearchKeyword.toLocaleLowerCase())}
						<WatchlistItem {item} {userId} {eloRatingStats} />
					{/if}
				{/each}
			</ul>
		{:else}
			<p class="text-center">No items in watchlist.</p>
		{/if}
	</div>

	<WatchlistRightSidebar {isDefault} {userId} {loading} {watchlistInfo} />
</div>

<style lang="postcss">
</style>

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
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { ExtendedWatchlist, ExtendedWatchlistItem } from '$lib/server/watchlist/types';
	import {
		watchlistSortDirection,
		watchlistSortOption,
		watchlistActiveGenres,
		watchlistIsLoading,
		watchlistSearchKeyword,
		isEditingItems,
		selectedItemIds,
		watchlistItems
	} from '$lib/stores/watchlist';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { onDestroy } from 'svelte';
	import type { Writable } from 'svelte/store';
	import DeleteIcon from '../icons/DeleteIcon.svelte';
	import InfoIcon from '../icons/InfoIcon.svelte';
	import RegularEditIcon from '../icons/RegularEditIcon.svelte';
	import SolidEditIcon from '../icons/SolidEditIcon.svelte';
	import SortSelect, { type SortOption } from '../input/SortSelect.svelte';
	import SkeletonWatchlistItem from './SkeletonWatchlistItem.svelte';
	import WatchlistEditMultiple from './WatchlistEditMultiple.svelte';
	import WatchlistItem from './WatchlistItem.svelte';
	import WatchlistRightSidebar from './WatchlistRightSidebar.svelte';

	export let items: Writable<ExtendedWatchlistItem[]>;
	export let isDefault = true;
	export let userId = '';
	export let watchlistId: string;

	const user = getUser();
	let loading = true;
	let isNavigateLoading = true;
	let initialHasLoaded = false;
	let watchlistInfo: WatchlistInfo | null = null;
	let eloRatingStats: EloRatingStats;
	let errorMessage: string;

	const _sort = $page.url.searchParams.get('sort');
	const _order = $page.url.searchParams.get('order');
	if (_sort) watchlistSortOption.set(_sort);
	if (_order) watchlistSortDirection.set(_order);

	$: watchlistIsLoading.set(loading && isNavigateLoading);

	const unsubscribe = items.subscribe((value) => {
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

		errorMessage = '';
		loading = true;
		isNavigateLoading = isNavigate;

		const params = new URLSearchParams();
		params.append('orderBy', $watchlistSortOption);
		params.append('orderDirection', $watchlistSortDirection);

		$page.url.searchParams.set('sort', $watchlistSortOption);
		$page.url.searchParams.set('order', $watchlistSortDirection);
		goto(`?${$page.url.searchParams.toString()}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
		})

		const resp = await fetch(`http://127.0.0.1:5173/api/user/${userId}/watchlist/${watchlistId}/?` + params);
		if (resp.status === 404) {
			const resultData: { message: string } = await resp.json();
			errorMessage = resultData.message;
			items.set([])
		}
		else {
			const resultData: ExtendedWatchlist = await resp.json();
			items.set(resultData.items);
			watchlistInfo = resultData;
		}

		loading = false;
		isNavigateLoading = false;
		initialHasLoaded = true;
	};

	afterNavigate((navigation) => {
		console.log(navigation.from?.url, $page.url)
		if (navigation.type == 'goto' && navigation.from?.url.pathname == $page.url.pathname) {
			console.log('Goto');
			return;
		}

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

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="flex flex-row w-full gap-x-10 grow mt-[-1rem] justify-center">
	<div class="flex flex-col w-full gap-y-4 max-w-2xl">
		<div
			class="flex flex-row w-full items-center gap-x-2 {loading || $items.length > 0
				? ''
				: 'invisible'}"
		>
			<WatchlistEditMultiple loading={loading} items={items} />

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
				{#each $items as item (item.item.id)}
					{#if item.item.genres.some( (genre) => [undefined, true].includes($watchlistActiveGenres[genre.name]) ) && item.item.title
							.toLocaleLowerCase()
							.includes($watchlistSearchKeyword.toLocaleLowerCase())}
						<WatchlistItem {item} {userId} {eloRatingStats} />
					{/if}
				{/each}
			</ul>
		{:else if errorMessage && !loading}
			<p class="text-center text-red-11">{errorMessage}</p>
		{:else}
			<p class="text-center">No items in watchlist.</p>
		{/if}
	</div>

	<WatchlistRightSidebar {isDefault} {userId} {loading} {watchlistInfo} />
</div>

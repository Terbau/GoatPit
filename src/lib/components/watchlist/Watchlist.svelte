<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import type { ExtendedWatchlistItem } from '$lib/server/functions';
	import {
		watchlistSortDirection,
		watchlistSortOption,
		watchlistActiveGenres
	} from '$lib/stores/watchlist';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import type { Writable } from 'svelte/store';
	import InfoIcon from '../icons/InfoIcon.svelte';
	import SortSelect, { type SortOption } from '../input/SortSelect.svelte';
	import SkeletonWatchlistItem from './SkeletonWatchlistItem.svelte';
	import WatchlistItem from './WatchlistItem.svelte';

	export let items: Writable<ExtendedWatchlistItem[]>;
	export let isDefault = true;
	export let userId = '';

	const user = getUser();
	let loading = true;

	const fetchAndSetItems = async () => {
		if (!browser) return;

		loading = true;

		const params = new URLSearchParams();
		params.append('orderBy', $watchlistSortOption);
		params.append('orderDirection', $watchlistSortDirection);

		const resp = await fetch(
			`http://127.0.0.1:5173/api/user/${userId}/watchlist/items?` + params
		);
		const fetchedItems = await resp.json();

		items.set(fetchedItems);
		loading = false;
	};

	afterNavigate(() => {
		fetchAndSetItems();
		console.log("Navigate")
	});
	// watchlistSortOption.subscribe(fetchAndSetItems);
	// watchlistSortDirection.subscribe(fetchAndSetItems);

	const sortOptions: SortOption[] = [
		{ label: 'Date added', value: 'added' },
		{ label: 'Your Elo Rating', value: 'eloRating' },
	];

	sortOptions.forEach((option) => {
		if (option.value === $watchlistSortOption) {
			option.selected = true;
		}
	});

	const handleSelect = (e: Event) => {
		const selectedOption = e.target as HTMLSelectElement;
		watchlistSortOption.set(selectedOption.value);
		console.log(selectedOption.value);
		fetchAndSetItems();
	};

	const handleSortDirectionChange = (e: CustomEvent<string>) => {
		watchlistSortDirection.set(e.detail);
		fetchAndSetItems();
	};
</script>

<div class="flex flex-row gap-x-10 grow mt-[-1rem]">
	<div class="flex flex-col w-full justify-center gap-y-4">
		<div class="flex flex-row w-full items-center gap-x-2">
			<!-- <button class="bordered-button-indigo w-72">
				Import from IMDb
			</button> -->
			<SortSelect
				sortDirection={$watchlistSortDirection}
				options={sortOptions}
				{loading}
				on:change={handleSelect}
				on:sortDirectionChange={handleSortDirectionChange}
			/>
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
					{#if item.item.genres.some( (genre) => [undefined, true].includes($watchlistActiveGenres[genre.name]) )}
						<WatchlistItem {item} {userId} />
					{/if}
				{/each}
			</ul>
		{:else}
			<p>No items in watchlist.</p>
		{/if}
	</div>

	<div class="p-5 bg-indigo-3 h-fit w-72 shrink-0 mt-16">
		{#if $user?.id == userId}
			<div class="flex flex-row gap-x-2 text-sm items-center mb-4">
				<i class="h-full w-8 stroke-current text-blue-11">
					<InfoIcon />
				</i>
				<p>Click an item to view options</p>
			</div>
		{/if}

		<h1 class="font-bold text-lg">
			My watchlist
			{#if isDefault}
				<span class="text-indigo-11 text-sm font-normal"> (default)</span>
			{/if}
		</h1>
		<p class="text-md">Created by Terbau</p>
	</div>
</div>

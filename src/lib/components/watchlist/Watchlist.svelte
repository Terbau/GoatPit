<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { ExtendedWatchlistItem } from '$lib/server/functions';
	import { watchlistSortDirection, watchlistSortOption } from '$lib/stores/watchlist';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { select_options } from 'svelte/internal';
	import type { Writable } from 'svelte/store';
	import InfoIcon from '../icons/InfoIcon.svelte';
	import SortLargeToSmallIcon from '../icons/SortLargeToSmallIcon.svelte';
	import SortSelect, { type SortOption } from '../input/SortSelect.svelte';
	import SkeletonWatchlistItem from './SkeletonWatchlistItem.svelte';
	import WatchlistItem from './WatchlistItem.svelte';

	export let items: Writable<ExtendedWatchlistItem[]>;
	export let isDefault = true;
	export let userId = '';

	const user = getUser();
	let loading = true;

	afterNavigate(async () => {
		console.log('afterNavigate');
		loading = true;

		const resp = await fetch(`/api/user/${userId}/watchlist/items`);
		const fetchedItems = await resp.json();

		items.set(fetchedItems);
		loading = false;
	});

	const sortOptions: SortOption[] = [
		{ label: 'Date added', value: 'added' },
		{ label: 'Title', value: 'title' },
		{ label: 'Rating', value: 'rating' },
    { label: 'Your rating', value: 'ownUserRating' },
    { label: 'Owners rating', value: 'ownersRating' },
	];

	sortOptions.forEach((option) => {
		if (option.value === $watchlistSortOption) {
			option.selected = true;
		}
	});

	const handleSelect = (e: Event) => {
		const selectedOption = e.target as HTMLSelectElement;
		watchlistSortOption.set(selectedOption.value);
    console.log(selectedOption.value)
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
        loading={loading}
				on:change={handleSelect}
        on:sortDirectionChange={(e) => {
          watchlistSortDirection.set(e.detail);
        }}
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
					<WatchlistItem {item} {userId} />
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

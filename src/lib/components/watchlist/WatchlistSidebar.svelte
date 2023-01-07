<script lang="ts">
	import { browser } from '$app/environment';
	import type { IMDBGenre } from '$lib/server/database/types/imdb';
	import type { ExtendedWatchlistItem } from '$lib/server/functions';
	import { addAlert } from '$lib/stores/alert';
	import {
		defaultWatchlist,
		watchlistActiveGenres,
		watchlistIsLoading,
		watchlistSearchKeyword
	} from '$lib/stores/watchlist';
	import { getUser } from '@lucia-auth/sveltekit/client';

	export let userId: string;
	const user = getUser();
	let searchKeyword = '';

	$: $watchlistSearchKeyword = searchKeyword;

	let genres: string[];
	$: genres = (() => {
		const genresSet = new Set<string>();
		$defaultWatchlist.forEach((item: ExtendedWatchlistItem) => {
			item.item.genres.forEach((genre) => {
				if (genresSet.has(genre.name)) return;

				genresSet.add(genre.name);
			});
		});

		return Array.from(genresSet);
	})();

	const handleGenreChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const genre = target.value;
		const checked = target.checked;

		if (genre === 'all') {
			if (checked) {
				$watchlistActiveGenres = {};
			} else {
				$watchlistActiveGenres = Object.fromEntries(genres.map((genre) => [genre, false]));
			}

			return;
		}

		$watchlistActiveGenres = {
			...$watchlistActiveGenres,
			[genre]: checked
		};
	};
</script>

<div class="w-64 mt-12 shrink-0 flex flex-col gap-y-10">
	{#if $watchlistIsLoading}
		<div class="flex flex-col gap-y-2">
			<div class="skeleton-bar h-8 w-1/2"></div>
			<div class="skeleton-bar h-8"></div>
		</div>

		<div class="flex flex-col gap-y-2">
			<div class="skeleton-bar h-8" />
			<div class="skeleton-bar h-8 w-3/5" />
			<div class="divider animate-pulse" />
			<div class="skeleton-bar h-8 w-3/5" />
			<div class="skeleton-bar h-8 w-3/5" />
			<div class="skeleton-bar h-8 w-3/5" />
		</div>
	{:else}
		<div class="">
			<h2 class="mb-1 ml-1">Find item in list</h2>
			<input
				type="text"
				placeholder="Item title"
				class="flex flex-row bg-indigo-3 font-normal px-4 py-2 w-full text-indigo-12 focus:ring-2 focus:ring-indigo-11 rounded-lg"
				bind:value={searchKeyword}
			/>
		</div>
	{/if}

	{#if genres.length >= 0 && $defaultWatchlist.length > 0}
		<form on:change={handleGenreChange}>
			<h2>Genres</h2>
			<div class="flex flex-row items-center gap-x-1 mt-2">
				<input
					type="checkbox"
					value="all"
					class="checkbox checkbox-info"
					checked={!genres.some(
						(genre) => ![undefined, true].includes($watchlistActiveGenres[genre])
					)}
				/>
				<span class="label-text">Select all</span>
			</div>
			<div class="divider" />
			<ul class="flex flex-col gap-y-2">
				{#each genres.sort() as genre}
					<li class="flex flex-row items-center gap-x-1">
						<input
							type="checkbox"
							value={genre}
							checked={[undefined, true].includes($watchlistActiveGenres[genre])}
							class="checkbox checkbox-info"
						/>
						<span class="label-text">{genre}</span>
					</li>
				{/each}
			</ul>
		</form>
	{/if}
</div>

<style lang="postcss">
	h2 {
		@apply font-bold text-xl;
	}

	.divider {
		@apply my-1;
	}
</style>

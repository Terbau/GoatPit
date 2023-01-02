<script lang="ts">
	import { browser } from '$app/environment';
	import type { IMDBGenre } from '$lib/server/database/types/imdb';
	import type { ExtendedWatchlistItem } from '$lib/server/functions';
	import { addAlert } from '$lib/stores/alert';
	import {
		activeWatchlistUserId,
		prependToWatchlist,
		defaultWatchlist,
		watchlistActiveGenres
	} from '$lib/stores/watchlist';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import InfoTooltip from '../tooltip/InfoTooltip.svelte';

	export let userId: string;
	const user = getUser();

	let importButtonDisabled = true;
	let imdbUserId: string | null;

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
      }
      else {
        $watchlistActiveGenres = Object.fromEntries(genres.map((genre) => [genre, false]));
      }

      return;
    }

		$watchlistActiveGenres = {
			...$watchlistActiveGenres,
			[genre]: checked
		};
	};

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

		const resp = await fetch(`/api/user/${userId}/watchlist/items/import`, {
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
				addAlert({
					type: 'success',
					message: `Imported IMDb watchlist items`
				});
			}
		}
	};
</script>

<div class="w-64 mt-12 shrink-0 flex flex-col gap-y-10">
	<form on:change={handleGenreChange}>
		<h2>Genres</h2>
    <div class="flex flex-row items-center gap-x-1 mt-2">
      <input
        type="checkbox"
        value="all"
        class="checkbox checkbox-primary"
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
						class="checkbox checkbox-primary"
					/>
					<span class="label-text">{genre}</span>
				</li>
			{/each}
		</ul>
	</form>

	{#if $user?.id == userId}
		<form class="flex flex-col" on:submit|preventDefault={handleSubmit}>
			<!-- <label class="font-bold text-lg" for="">Import from IMDb watchlist</label> -->
			<h2 class="flex flex-row items-center gap-x-1">
				Import items
				<InfoTooltip label="Import items from IMDb watchlist" class="h-6 w-6" />
			</h2>

			<div class="divider" />
			<div class="flex flex-col gap-y-2">
				<input
					type="text"
					placeholder="IMDb watchlist"
					class="input w-full max-w-xs"
					on:input={handleInputChange}
				/>
				<button class="btn btn-warning {!imdbUserId ? 'btn-disabled bg-yellow-5' : ''}">
					Import
				</button>
			</div>
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

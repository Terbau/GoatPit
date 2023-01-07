<script lang="ts">
	import type { ExtendedIMDBItem } from '$lib/server/functions';
	import { activeWatchlistUserId } from '$lib/stores/watchlist';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import type { EloRatingStats } from './Watchlist.svelte';

	export let visible = false;
	export let imdbItem: ExtendedIMDBItem;
	export let eloRatingStats: EloRatingStats;

	const user = getUser();

	let ers = eloRatingStats;

	let hasEloRating = imdbItem.eloRating !== null;
	let eloRating = imdbItem.eloRating ?? 0;
	let eloPercentage = hasEloRating
		? Math.floor(((eloRating - ers.min) * 100) / (ers.max - ers.min))
		: 100;
	let readableEloRating = hasEloRating ? Math.floor(eloRating) : 'Not rated';

	let hasRequestersEloRating = imdbItem.requestersEloRating !== null;
	let requestersEloRating = imdbItem.requestersEloRating ?? 0;
	let requestersEloPercentage = hasRequestersEloRating
		? Math.floor(((requestersEloRating - ers.minR) * 100) / (ers.maxR - ers.minR))
		: 0;
	let readableRequestersEloRating = hasRequestersEloRating
		? Math.floor(requestersEloRating)
		: 'Not rated';
</script>

<div
	class="absolute w-[30%] h-full rounded-xl bg-indigo-0 p-0 flex flex-col gap-y-1
    right-[calc((30%+6px)*-1)] z-50 {visible ? '' : 'hidden'}"
>
	<div class="stat-container rounded-t-xl">
		<div class="flex flex-col items-start">
			<h3>Elo Rating</h3>
			<p>{readableEloRating}</p>
		</div>
		<div class="tooltip" data-tip="Elo compared to the min and max in your list">
			<div class="radial-progress text-blue-indigo" style="--size:3.5rem; --value:{eloPercentage};">
				{hasEloRating ? eloPercentage+'%' : 'N/A'}
			</div>
		</div>
	</div>

	<div class="stat-container rounded-b-xl">
		{#if $user?.id !== $activeWatchlistUserId}
			<div
				class="flex flex-col items-start {$user?.id === $activeWatchlistUserId ? 'invisible' : ''}"
			>
				<h3>Your Elo Rating</h3>
				<p>{readableRequestersEloRating}</p>
			</div>
			<div
				class="tooltip {$user?.id === $activeWatchlistUserId ? 'invisible' : ''}"
				data-tip="Elo compared to the min and max in your list"
			>
				<div
					class="radial-progress text-blue-indigo"
					style="--size:3.5rem; --value:{requestersEloPercentage};"
				>
					{requestersEloPercentage}%
				</div>
			</div>
		{:else}
			<div class="text-xl text-center w-full">-------</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	:root {
		/* --testcolor: linear-gradient(to right, var(--tw-gradient-stops)); */
		--testcolor: var(--blue11);
	}

	.stat-container {
		@apply flex flex-row items-center h-full gap-y-1 bg-indigo-5 justify-between px-3 grow-0;
	}

	.stat-container > div {
		@apply text-blue-indigo ;
	}

	.stat-container > div > p {
		@apply text-indigo-12 text-sm;
	}

	.radial-progress::before {
		background: radial-gradient(farthest-side, var(--indigo11) 98%, #0000) top/var(--thickness)
				var(--thickness) no-repeat,
			conic-gradient(var(--indigo11), var(--blue11) calc(var(--value) * 1%), #0000 0);
		-webkit-mask: radial-gradient(
			farthest-side,
			#0000 calc(99% - var(--thickness)),
			#000 calc(100% - var(--thickness))
		);
		mask: radial-gradient(
			farthest-side,
			#0000 calc(99% - var(--thickness)),
			#000 calc(100% - var(--thickness))
		);
	}

	.text-blue-indigo {
		@apply bg-gradient-to-r from-indigo-11 to-blue-11 bg-clip-text text-transparent;
	}

	.stat-container h3 {
		@apply font-bold text-center whitespace-nowrap;
	}
</style>

<script lang="ts">
	import { browser } from '$app/environment';
	import InfoIcon from '$lib/components/icons/InfoIcon.svelte';
	import MultipleSelect, { type SelectOption } from '$lib/components/input/MultipleSelect.svelte';
	import { currentGame } from '$lib/stores/autorank';
	import { getUser } from '@lucia-auth/sveltekit/client';

  const user = getUser();

	const watchlistOptions = [
		{ label: 'All', value: 'all', selected: true, default: true, mustBeUnique: true },
		{ label: 'Default Watchlist', value: 'default' }
	];

	const commonFactorOptions = [
		{ label: 'No factor', value: 'none', selected: true, default: true, mustBeUnique: true },
		{ label: 'Random', value: 'random', mustBeUnique: true },
		{ label: 'Genre', value: 'genre' }
	];

	let selectedWatchlistOptions: SelectOption[];
	let selectedCommonFactorOptions: SelectOption[];

	const handleSubmit = async () => {
		if (!browser) return;
		console.log('submit');
    console.log(selectedWatchlistOptions)
    console.log(selectedCommonFactorOptions)

    let watchlistIds: string[] = [];
    if (selectedWatchlistOptions[0]?.value !== 'all')
      watchlistIds = selectedWatchlistOptions.map((x) => x.value);

    const params = new URLSearchParams();

    if (watchlistIds.length > 0)
      params.append('watchlistIds', watchlistIds.join(','));

		// TODO: FIX [?]
    const resp = await fetch(
      `/api/autorank/${$user?.id}` + params,
    );

    if (resp.ok) {
      const data = await resp.json()
      currentGame.set(data);

      // setTimeout(() => {
        // window.location.href = '/autorank/game';
      // }, 1000);
      window.location.href = '/autorank/game';
      // redirect(301, '/autorank/game');
    } else {
      console.log('error')
			currentGame.set(null);
			window.location.href = '/autorank/game';
    }
	};
</script>

<div class="mx-auto mt-10 w-3/5 flex flex-col items-center">
	<h1 class="text-2xl font-bold">AutoRank - Setup</h1>

	<!-- <p>Before starting the game, please configure how you want the game to behave.</p> -->

	<form
		class="flex flex-col items-center p-8 max-w-lg w-full rounded-xl gap-y-6 box-border"
		on:submit|preventDefault={handleSubmit}
	>
		<fieldset>
			<legend>
				Watchlists
				<div data-tip="What watchlists items should be chosen from">
					<InfoIcon />
				</div>
			</legend>
			<MultipleSelect
				options={watchlistOptions}
				bind:selectedOptions={selectedWatchlistOptions}
			/>
		</fieldset>

		<fieldset>
			<legend>
				Common factor
				<div data-tip="What common factors the items should have">
					<InfoIcon />
				</div>
			</legend>
			<MultipleSelect
				options={commonFactorOptions}
				bind:selectedOptions={selectedCommonFactorOptions}
			/>
		</fieldset>

		<button class="bordered-button-indigo w-full">Start</button>
	</form>
</div>

<style lang="postcss">
	form fieldset legend {
		@apply text-lg font-bold flex flex-row gap-x-1 px-1;
	}

	legend > div {
		@apply w-6 h-6 inline-block stroke-current text-blue-11 tooltip tooltip-info font-normal;
	}

	form fieldset {
		@apply flex flex-col w-full gap-y-2 border border-solid border-slate-8 pt-4 pb-6 px-8 rounded-xl;
	}
</style>

<script lang="ts">
	import WarningIcon from '$lib/components/icons/WarningIcon.svelte';
	import { currentGame } from '$lib/stores/autorank';
	import { decodeJwtNoVerify, sleep, transformImdbImageSize } from '$lib/utils';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import type { PageData } from './$types';
	import type { ItemEloMatchup, RandomMatchup, RandomMatchupPayload } from '$lib/server/elo/types';

	export let data: PageData;

  const user = getUser();

  $: item1 = $currentGame?.items[0];
  $: item2 = $currentGame?.items[1];
  $: jwtData = $currentGame ? decodeJwtNoVerify<ItemEloMatchup>($currentGame.token) : null;

	let item1Element: HTMLElement;
	let item2Element: HTMLElement;

	// State vars
	let hasClicked: boolean;
	let item1Classes: string;
	let item2Classes: string;
  let item1Image: string;
  let item2Image: string;

	// console.log(data.gameData)
	// console.log($currentGame);

  const resetState = () => {
    hasClicked = false;
	  item1Classes = '';
	  item2Classes = '';
  }

	const onKeyDown = async (event: KeyboardEvent) => {
		if (!data.isLoaded) return;

		const key = event.key;

		switch (key) {
			case 'ArrowLeft':
				item1Element.click();
				break;
			case 'ArrowRight':
				item2Element.click();
				break;
		}
	};

  export const preloadImages = async (urls: string[]): Promise<void> => {
    await Promise.all(
      urls.map((url) => {
        return new Promise((resolve) => {
          const image = new Image();
          image.src = url;
          image.onload = resolve;
        });
      })
    );
  }

	const handleClick = async (itemNum: 1 | 2) => {
		if (hasClicked || !item1 || !item2 || !$currentGame) return;
		hasClicked = true;
    const sleepPromise = sleep(500);

    let winner: string;

		if (itemNum === 1) {
			item1Classes = 'selected';
			item2Classes = 'not-selected';

      winner = item1.id;
		} else {
			item1Classes = 'not-selected';
			item2Classes = 'selected';

      winner = item2.id;
		}

    const resp = await fetch(
      `/api/autorank/${$user?.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: $currentGame.token,
          winnerImdbItemId: winner,
          compareFactorTypes: $currentGame.compareFactorTypes,
          genreNames: $currentGame.genreNames,
          watchlistIds: $currentGame.watchlistIds,
        }),
      }
    );

    if (resp.ok) {
      const newGameData: RandomMatchupPayload = await resp.json();

      
      const preItem1Image = transformImdbImageSize(newGameData.items[0].imageUrl, 300);
      const preItem2Image = transformImdbImageSize(newGameData.items[1].imageUrl, 300);
      
      await Promise.all([
        await sleepPromise,
        await preloadImages([preItem1Image, preItem2Image]),
      ]);

      item1Image = preItem1Image;
      item2Image = preItem2Image;

      currentGame.set(newGameData);
      resetState();

    } else {
      console.error(resp);
    }
	};

  resetState();
</script>

<svelte:window on:keydown={onKeyDown} />

{#if !data.isLoaded}
	<div class="mx-auto mt-10 h-20 items-center w-20 fill-slate-8">
		<!-- <Spinner animated/> -->
		Loading...
	</div>
{:else if !$currentGame}
	<div class="flex flex-col mx-auto mt-10 items-center gap-y-4">
		<div class="h-12 w-12 stroke-current text-yellow-11">
			<WarningIcon />
		</div>

		<p class="text-lg">Could not find a configured game.</p>

		<a href="/autorank/setup" class="bordered-button-indigo">Go to setup</a>
	</div>
{:else if item1 && item2 && jwtData}
	<!-- Could use else but typescript wont shut up -->
	<div class="mt-10 mx-auto flex flex-col items-center w-full gap-y-10">
		<h1 class="font-bold text-2xl">Which movie is better?</h1>
		<div class="movie-container flex flex-row px-24">
			<button
				bind:this={item1Element}
				on:click={() => handleClick(1)}
				class="movie rounded-l-2xl flex-row {item1Classes}"
			>
				<img src={item1Image || transformImdbImageSize(item1.imageUrl)} alt="" />
				<div>
					<h2>{item1.title}</h2>
          <p>{jwtData.itemElo1}</p>
				</div>
			</button>

			<div class="divider divider-horizontal px-10">Or</div>

			<button
				bind:this={item2Element}
				on:click={() => handleClick(2)}
				class="movie rounded-r-2xl flex-row-reverse {item2Classes}"
			>
				<img src={item2Image || transformImdbImageSize(item2.imageUrl)} alt="" />
				<div>
					<h2>{item2.title}</h2>
          <p>{jwtData.itemElo2}</p>
				</div>
			</button>
		</div>

		<div class="flex justify-center gap-x-2 h-full w-full items-end">
			<kbd class="kbd">◀︎</kbd>
			<div class="flex flex-col inner-kbd gap-y-2">
				<kbd class="kbd">▲</kbd>
				<kbd class="kbd">▼</kbd>
			</div>
			<kbd class="kbd">▶︎</kbd>
		</div>
	</div>
	<!-- <pre class="text-sm">
{JSON.stringify($currentGame, null, 2)}
  </pre> -->
{/if}

<style lang="postcss">
	.selected {
		@apply scale-105;
	}

	.not-selected {
		@apply filter blur-[2px] scale-95;
	}

	.kbd {
		@apply h-16 w-16;
	}

	.inner-kbd > * {
		/* @apply bg-slate-10; */
	}

	.movie {
		@apply flex h-64 max-w-lg min-w-min w-screen bg-base-200 overflow-hidden transition duration-500 shadow-2xl;
	}

	.movie > div {
		@apply flex flex-col items-center justify-center grow h-full;
	}

	.movie h2 {
		@apply font-bold text-3xl;
	}

	.movie-container img {
		@apply object-fill shrink-0 h-64 w-44;
	}
</style>

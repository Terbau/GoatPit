<script lang="ts">
	import { goto } from '$app/navigation';
	import AutoRankAnimation from '$lib/components/mockup/AutoRankMockup.svelte';
	import WatchlistMockup from '$lib/components/mockup/WatchlistMockup.svelte';
	import WindowMockup from '$lib/components/mockup/WindowMockup.svelte';
	import { getUser } from '@lucia-auth/sveltekit/client';

	const user = getUser();
</script>

<div class="min-h-screen box-content mt-16 mb-8 flex flex-col w-full xl:mb-32">
	<div class="flex flex-col items-center mx-auto mt-[5vh] mb-32">
		<div class="max-w-[95%] md:max-w-md lg:max-w-2xl flex flex-col items-center px-10 gap-y-4">
			<h1
				class="blue-gradient-text font-bold text-[2rem] md:text-[3rem] whitespace-nowrap"
			>
				Welcome to GoatPit
			</h1>
			<p class="text-lg text-center">
				Organize, filter and keep track of your watched movies and series. Built by movie watching
				and web developer professionals (totally), GoatPit is designed to allow you to truly enter
				the movie watching zen. Gone are the days of boring movie sites, GoatPit is here to stay.
				Thanks CoPilot for that last line.
			</p>
		</div>

		<!-- <div class="flex justify-center grow">
      <img class="h-64 mr-50%" src="/images/goat.png" alt="">
    </div> -->
	</div>

	<div class="showcase">
		<div>
			<div>
				<a
					href="/autorank"
					class="hover-slide-underline blue-gradient-text h2-link"
				>
					AutoRank
				</a>
				<p>
					AutoRank is a state of the art feature that allows you to automatically rank movies based
					on your preferences. You can set up a list of movies and then let GoatPit do the rest. It
					will automatically rank the movies based on your preferences and you can then use the list
					to find new movies to watch.
				</p>
			</div>

			<WindowMockup>
				<AutoRankAnimation />
			</WindowMockup>
		</div>
	</div>

	<div class="showcase">
		<div>
			<WindowMockup>
				<WatchlistMockup />
			</WindowMockup>
			<div>
				<a
					on:click|preventDefault={() => {
            if (!$user) {
              goto('/watchlist');
            }
            else {
              goto(`/watchlist/${$user?.id}`);
            }
          }}
          href="/"
          data-sveltekit-preload-data="tap"
					class="hover-slide-underline blue-gradient-text h2-link"
				>
					Watchlist
				</a>
				<p>
					What would a website about movies and series be without movie tracking functionality?
					GoatPit offers, like many others, a full flegded watchlist system. Here you can add, view
					and remove movies and series, either those you have already seen, or those you'd like to.
					Other functionality within this site might also require you to have items in your
					watchlist.
				</p>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.showcase {
		@apply border-y py-24 border-transparent bg-black/0;
	}

	.showcase:nth-of-type(even) {
		@apply bg-black/40;
	}

	.showcase > div {
		@apply flex flex-col items-center gap-y-10 w-[80%] gap-x-8 mx-auto xl:flex-row xl:justify-center 2xl:gap-x-24;
	}

	.showcase > div > div {
		@apply max-w-lg flex flex-col gap-y-4 text-center px-4 xl:max-w-md xl:text-left;
	}

	.showcase > div > div > a {
		@apply font-bold text-[2rem] mx-auto xl:mx-0;
	}

	.showcase > div > div > p {
		@apply text-base md:text-lg;
	}
</style>

<script lang="ts">
	import { addAlert } from "$lib/stores/alert";
	import { activeWatchlistUserId, prependToWatchlist } from "$lib/stores/watchlist";
	import { getUser } from "@lucia-auth/sveltekit/client";

	export let userId: string;
  const user = getUser();

	let importButtonDisabled = true;
	let imdbUserId: string | null;

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
    if (!imdbUserId) return;

    const resp = await fetch(`/api/user/${userId}/watchlist/items/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imdbUserId }),
    });

    if (resp.ok) {
      if ($activeWatchlistUserId == $user?.id) {
        const respData = await resp.json();
        prependToWatchlist(respData.newItems);
        addAlert({
          type: "success",
          message: `Imported IMDb watchlist items`,
        });
      }
    }
  };
</script>

<div class="w-64 mt-12 shrink-0 flex flex-col">
  {#if $user?.id == userId}
    <form class="flex flex-col gap-y-2" on:submit|preventDefault={handleSubmit}>
      <!-- <label class="font-bold text-lg" for="">Import from IMDb watchlist</label> -->
      <input
        type="text"
        placeholder="IMDb watchlist"
        class="input w-full max-w-xs"
        on:input={handleInputChange}
      />
      <button
        class="btn btn-warning {!imdbUserId
          ? 'btn-disabled'
          : ''}">Import</button
      >
    </form>
  {/if}
</div>

<!-- 
<div class="w-64 shrink-0 flex flex-col">
  <div class="flex flex-row bg-indigo-3 focus-within:ring-2 focus-within:ring-indigo-11 rounded-lg mb-10">
    <input
      type="text"
      placeholder="Search IMDb..."
      class="font-normal rounded-lg px-4 py-2 bg-inherit w-full
              focus:outline-none focus:ring-0"
      bind:value={searchValue}
      on:input={handleSearchChange}
    >
    <div class="w-8 p-1 fill-indigo-9 flex items-center justify-center mr-1">
      {#if activeTimeout || searching}
        <Spinner animated />
      {/if}
    </div>
  </div>

  <LoadingTextInput>Search:</LoadingTextInput>
  

  {#if resultEntries.length > 0}
    <div class="mt-3 flex flex-col gap-y-2">
      {#each resultEntries as entry}
        {#if entry.image && entry.yearReleased && entry.yearReleased <= currentYear}
          <div class="flex flex-row gap-x-2 hover:bg-indigo-3 cursor-pointer group">
            <div class="h-20 w-14 relative">
              <img class="h-full w-full object-cover" src={entry.image.imageUrl} alt="">
              <div class="absolute top-0 bottom-0 h-full w-full
                        bg-black/50 flex items-center justify-center invisible group-hover:visible">
                <button 
                  class="w-8 h-8 p-2 flex items-center justify-center fill-indigo-12
                         bg-indigo-8 hover:bg-indigo-9 active:bg-indigo-10 rounded-md"
                  on:click={() => handleAddToWatchlist(entry)}
                >
                  <PlusIcon />
                </button>
              </div>
            </div>
            <div class="flex flex-col">
              <p class="font-bold">{entry.title}</p>
              <p class="text-sm">{entry.yearReleased}</p>
            </div>

            
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div> -->

<style lang="postcss">
	fieldset {
		@apply flex flex-col gap-y-1;
	}
</style>

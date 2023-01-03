<script lang="ts">
	import LoadingTextInput from "../input/LoadingTextInput.svelte";
  import type { SearchResultEntry } from "@goatpit/imdb";
	import { activeWatchlistUserId, prependToWatchlist } from "$lib/stores/watchlist";
	import { addAlert } from "$lib/stores/alert";
	import LoadingSearchInput from "../input/LoadingSearchInput.svelte";
	import { clickOutside, transformImdbImageSize } from "$lib/utils";
	import { getUser } from "@lucia-auth/sveltekit/client";
	import { browser } from "$app/environment";

  // export let userId: string;
  const user = getUser();

  const currentYear = (new Date()).getFullYear();

  let searchValue = "";
  let activeTimeout: NodeJS.Timeout | null = null;
  let searching = false;
  let resultEntries: SearchResultEntry[] = [];

  // resultEntries = [{"id":"tt1375666","title":"Inception","type":"movie","yearReleased":2010,"image":{"height":1037,"imageUrl":"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg","width":700},"rank":289,"highlightedActors":"Leonardo DiCaprio, Joseph Gordon-Levitt"},{"id":"tt8269586","title":"Bikini Inception","type":"movie","yearReleased":2015,"image":{"height":500,"imageUrl":"https://m.media-amazon.com/images/M/MV5BNDk3NTNmNGEtOWJkYi00NGEyLThkZDQtOTBlZmRhN2IwYTk0XkEyXkFqcGdeQXVyNTM3MDMyMDQ@._V1_.jpg","width":375},"rank":83662,"highlightedActors":"Paizley Bishop, Byamba"},{"id":"tt6793710","title":"The Crack: Inception","type":"movie","yearReleased":2019,"image":{"height":960,"imageUrl":"https://m.media-amazon.com/images/M/MV5BZTU1M2U4OWUtZTQ5OS00OWM1LTljN2EtMWJmZDgxNzUwZGNkXkEyXkFqcGdeQXVyMTA0MjU0Ng@@._V1_.jpg","width":672},"rank":71351,"highlightedActors":"Carlos Santos, Miguel Ángel Muñoz"},{"id":"tt12960252","title":"Inception Premiere","type":"movie","yearReleased":2010,"rank":480908,"highlightedActors":"Tera Hendrickson, Johnny Marr"},{"id":"tt5581256","title":"Inception","type":"movie","rank":1016250,"highlightedActors":""}]

  const searchAndDisplay = async () => {
    if (!browser) return;

    activeTimeout = null;
    searching = true;

    try {
      const resp = await fetch(
        `/api/search?query=${encodeURIComponent(searchValue)}`
      );

      resultEntries = await resp.json();
      // console.log(JSON.stringify(resultEntries))
    } finally {
      if (!activeTimeout) searching = false;
    }
  }

  const handleSearchChange = (e: Event) => {
    searchValue = (e.target as HTMLInputElement).value;

    if (activeTimeout) {
      clearTimeout(activeTimeout);
      activeTimeout = null;
    }

    if (searchValue.length > 0) {
      activeTimeout = setTimeout(() => {
        console.log("searching for", searchValue);
        searchAndDisplay();
      }, 300);
    } else {
      resultEntries = [];
    }
  };

  const handleAddToWatchlist = async (entry: SearchResultEntry, event: Event) => {
    if (!browser) return;
    console.log("add to watchlist", entry);
    // Close the search dropdown...

    if (!$user) return;

    const resp = await fetch(`/api/user/${$user.id}/watchlist/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([entry.id]),
    });

    if (resp.ok) {
      console.log("addedd to watchlist");
      const respData = await resp.json();

      if (respData.newItems) {
        if ($activeWatchlistUserId == $user.id) {
          prependToWatchlist(respData.newItems);
          addAlert({
            type: "success",
            message: `Added ${entry.title} to watchlist`,
          });
        }
      }
    } else {
      console.error("failed to add to watchlist");
    }

    const target = event?.target as HTMLElement;
    target?.blur();
  };
</script>

<div class="min-w-[10rem] max-w-[40rem] grow box-border ml-auto relative group">
  <LoadingSearchInput
    props={{ placeholder: "Search" }}
    bind:value={searchValue}
    on:input={handleSearchChange}
    loading={!!activeTimeout || searching}
  />

  {#if resultEntries.length > 0}
    <ul 
      class="absolute mt-4 min-w-[18rem] w-full grow-0 flex flex-col gap-y-3 bg-indigo-3 shadow-2xl pb-2 pt-2
             max-h-[50vh] overflow-y-auto custom-scrollbar invisible group-focus-within:visible"
    >
      {#each resultEntries as entry}
        {#if entry.image}
          <li>
            <a 
              href="/" 
              class="w-full h-full flex flex-row cursor-pointer hover:bg-indigo-4 px-4 items-center gap-x-2"
            >
              <img class="h-16 w-12 object-fill shrink-0" src={transformImdbImageSize(entry.image.imageUrl, 100)} loading="lazy" alt="">
              <div class="flex flex-col truncate">
                <div class="w-full truncate font-bold text-lg">{entry.title}</div>
                <div class="text-sm text-gray-500">
                  {entry.yearReleased || currentYear}
                </div>
              </div>
              <div class="flex-grow" />
              <button
                disabled={!$user}
                class="bg-indigo-8 text-white font-bold py-2 px-4 rounded hover:bg-indigo-9 active:bg-indigo-10
                      disabled:bg-slate-9 disabled:cursor-not-allowed"
                on:click|stopPropagation|preventDefault={(e) => handleAddToWatchlist(entry, e)}
              >
                Add
              </button>
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>
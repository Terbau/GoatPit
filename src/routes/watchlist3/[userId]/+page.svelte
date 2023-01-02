<script lang="ts">
	import { browser } from "$app/environment";
	import TextInput from "$lib/components/input/TextInput.svelte";
  import { getUser } from "@lucia-auth/sveltekit/client";
	import type { PageServerData } from "./$types";

  export let data: PageServerData;

  const user = getUser();

  let movieIds: string = "tt1130884";

  let respContent = '';

  const handleSubmit = async () => {
    if (!browser) return;

    const splitMovieIds = movieIds.split(',');

    const resp = await fetch(
      `/api/user/${data.props.userId}/watchlist/items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(splitMovieIds)
      }
    );

    const respData = await resp.json();
    respContent = JSON.stringify(respData, null, 4);
  }
  
</script>

{#if $user}
  <div class="w-full mx-auto flex flex-col gap-4 mt-8">
    <h1 class="font-bold text-2xl">My Watchlist</h1>

    <form 
      class="flex flex-col gap-4"
      on:submit|preventDefault={handleSubmit}
    >
      <TextInput
        bind:value={movieIds}
        required
      >
        Movie ids (comma separated)
      </TextInput>
      <button class="bordered-button-indigo">Submit</button>
    </form>

    {#if respContent}
      <pre class="text-indigo-12">
{respContent}
      </pre>
    {/if}
  </div>
{:else}
  <div class="w-2/3 mx-auto flex flex-col">
    <p class="text-indigo-11 text-center">
      You must be logged in to add movies to your watchlist.
    </p>
  </div>
{/if}

<script lang="ts">
	import NotLoggedIn from "$lib/components/auth/NotLoggedIn.svelte";
import { getUser } from "@lucia-auth/sveltekit/client";

  const user = getUser();
</script>

{#if !$user}
  <NotLoggedIn />
{:else}
  <slot />
{/if}
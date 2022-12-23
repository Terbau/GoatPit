<script lang="ts">
	import { getUser } from "@lucia-auth/sveltekit/client";
	import Logout from "./LogoutButton.svelte";
  import { clickOutside } from "$lib/utils";
	import ProfileIcon from "../icons/ProfileIcon.svelte";

  export let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
  };

  const user = getUser();
</script>

<div
  class="h-12 w-12 relative"
  use:clickOutside={() => isOpen = false}
>
  <button class="rounded-full border border-solid p-[0.125rem] border-transparent active:border-indigo-9" on:click={toggle}>
    <ProfileIcon />
  </button>

  {#if isOpen}
    <div 
      class="absolute right-0 mt-2 w-60 bg-indigo-3
             rounded-lg shadow-lg overflow-hidden z-10 p-4
             text-indigo-11 flex flex-col gap-4"
    >
      <p class="text-indigo-11  ">
        Logged in as:
        <span class="text-indigo-12 text-sm">{$user?.email}</span>
      </p>

      <Logout />
    </div>
  {/if}
</div>

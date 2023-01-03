<script lang="ts">
	import { getUser, signOut } from "@lucia-auth/sveltekit/client";
	import Logout from "./LogoutButton.svelte";
  import { clickOutside } from "$lib/utils";
	import ProfileIcon from "../icons/ProfileIcon.svelte";
	import { beforeNavigate, invalidateAll } from "$app/navigation";
	import LogoutIcon from "../icons/LogoutIcon.svelte";
	import MovieIcon from "../icons/MovieIcon.svelte";
	import UserIcon from "../icons/UserIcon.svelte";
	import SettingsIcon from "../icons/SettingsIcon.svelte";

  const user = getUser();

  const handleLogout = async () => {
    console.log("Signing out");
    await signOut();
    invalidateAll();
  };
</script>

<div
  class="h-12 w-12 relative group"
>
  <button
    class="rounded-full border border-solid p-[0.125rem] border-transparent active:border-indigo-9"
  >
    <ProfileIcon />
  </button>

  <div 
    class="absolute right-0 mt-2 w-72 bg-indigo-3
            rounded-lg shadow-2xl overflow-hidden z-10
            text-indigo-11 flex flex-col box-border
            max-h-[calc(100vh-6rem)] overflow-y-auto
            custom-scrollbar
            container invisible group-focus-within:visible"
    tabindex="-1"
  >
    <div class="p-4 focus:bg-green-7">
      <p class="text-indigo-11">
        Logged in as: <br>
        <span class="text-indigo-12 text-sm">{$user?.email}</span>
      </p>
      <p class="text-indigo-11 mt-2">
        User ID: <br>
        <span class="text-indigo-12 text-sm break-words">{$user?.id}</span>
      </p>
    </div>

    <div class="button-container">
      <a href="/profile">
        <div>
          <UserIcon />
        </div>
        Profile
      </a>
      <a href="/watchlist/{$user?.id}">
        <div>
          <MovieIcon />
        </div>
        My watchlist
      </a>
    </div>

    <div class="button-container">
      <button>
        <div>
          <SettingsIcon />
        </div>
        Settings
      </button>
    </div>

    <div class="button-container">
      <!-- <Logout /> -->
      <button on:click={handleLogout} class="">
        <div>
          <LogoutIcon />
        </div>
        Logout
      </button>
    </div>
  </div>
</div>

<style lang="postcss">
  .container > div {
    @apply border-b border-solid border-indigo-9;
  }

  .container > div:last-child {
    @apply border-b-0;
  }

  .button-container {
    @apply flex flex-col py-2;
  }

  .button-container > a, .button-container > button {
    @apply text-indigo-11 hover:bg-indigo-5 px-4 py-3 flex flex-row items-center gap-x-3;
  }

  .button-container > a > div, .button-container > button > div {
    @apply fill-indigo-11 h-5 w-5;
  }

  /* .button-container > a:hover {
    @apply bg-indigo-9;
  } */
</style>

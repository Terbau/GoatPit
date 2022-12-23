<script lang="ts">
  import Link from "$lib/components/navbar/Link.svelte";
  import LoginButton from "$lib/components/navbar/LoginButton.svelte";
  import { getUser } from "@lucia-auth/sveltekit/client";
	import ProfileDropdown from "./ProfileDropdown.svelte";

  const user = getUser();
</script>

<nav class="flex flex-row justify-between items-center w-full h-16 px-16
            border-b border-solid border-indigo-8"
>
  <div>
    <a href="/">
      <img src="https://flowbite.com/docs/images/logo.svg" class="h-6 mr-3 sm:h-9" alt="Flowbite Logo" />
    </a>
  </div>
  <div class="flex flex-row items-center gap-10">
    <div class="flex flex-row gap-6 text-indigo-12">
      <Link href="/">Home</Link>
      <Link href="/test">About</Link>
      <Link href="/">Contact</Link>
      <Link href="/">Info</Link>
    </div>

    {#if $user}
      <ProfileDropdown />
    {:else}
      <LoginButton />
    {/if}
    
  </div>
</nav>
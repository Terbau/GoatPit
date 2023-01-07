<script lang="ts">
  import Link from "$lib/components/navbar/Link.svelte";
  import LoginButton from "$lib/components/navbar/LoginButton.svelte";
  import { getUser } from "@lucia-auth/sveltekit/client";
	import NavbarSearch from "./NavbarSearch.svelte";
	import ProfileDropdown from "./ProfileDropdown.svelte";

  const user = getUser();
</script>

<nav class="fixed top-0 flex flex-row items-center w-full h-16 px-16
            border-b border-solid border-blue-8 bg-[rgba(7,3,53,1)] z-10"
>
  <a href="/" class="flex flex-row items-center text-3xl mr-5">
    <img src="/images/goat.png" class="mr-3 h-10" alt="Logo" />
    GoatPit
  </a>

  <NavbarSearch />

  <div class="flex flex-row items-center gap-10 ml-auto">
    <div class="flex flex-row gap-x-6 text-indigo-12">
      <Link href="/">Home</Link>
      <Link href="/autorank">AutoRank <span class="badge badge-info badge-md">NEW</span></Link>
      <Link href="/">Discover</Link>
      <!-- <Link href="/">Info</Link> -->
    </div>

    {#if $user}
      <ProfileDropdown />
    {:else}
      <LoginButton />
    {/if}
    
  </div>
</nav>
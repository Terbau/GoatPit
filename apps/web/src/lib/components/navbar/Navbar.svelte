<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import Link from '$lib/components/navbar/Link.svelte';
	import LoginButton from '$lib/components/navbar/LoginButton.svelte';
	import { betterSlide } from '$lib/utils';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { fade, fly, slide } from 'svelte/transition';
	import DropdownIcon from '../icons/DropdownIcon.svelte';
	import NavbarSearch from './NavbarSearch.svelte';
	import ProfileDropdown from './ProfileDropdown.svelte';
	import SidebarLink from './SidebarLink.svelte';

	const user = getUser();

  let checked = false;

  beforeNavigate(async () => {
    checked = false;
  });

	
</script>

<nav
	class="fixed top-0 flex flex-row items-center w-full h-16 px-4 md:px-16
         border-b border-solid border-blue-8 bg-[rgba(7,3,53,1)] z-10 justify-between"
>
	<div class="block w-8 h-8 md:hidden">
		<input id="navbar-drawer-toggle" type="checkbox" class="drawer-toggle" bind:checked={checked} />
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<label for="navbar-drawer-toggle" class="cursor-pointer" tabindex="0">
			<DropdownIcon />
		</label>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
    {#if checked}
      <div
        class="absolute bg-black/60 w-screen h-screen top-16 left-0 right-0 bottom-0"
        transition:fly
        on:click|self={() => {
          console.log("test")
          checked = false;
        }}
      />

      <div
        class="flex flex-col items-center absolute w-[18rem] h-screen top-16 left-0 right-0 bottom-0 bg-[rgba(7,3,53,1)] px-4 pt-8"
        id="drawer-content"
        tabindex="-1"
        transition:betterSlide={{ duration: 200, axis: 'x'}}
      >
        <div class="flex flex-col gap-y-6">
          <div class="w-[16rem]">
            <NavbarSearch />
          </div>

          <ul class="w-full flex flex-col items-center">
            <li>
              <SidebarLink href="/">Home</SidebarLink>
            </li>
            <li>
              <SidebarLink href="/autorank"
                >AutoRank <span class="badge badge-info badge-md">NEW</span></SidebarLink
              >
            </li>
            <li>
              <SidebarLink href="/discover">Discover</SidebarLink>
            </li>
            <!-- <li>
              <Link href="/">Info</Link>
            </li> -->
          </ul>
        </div>
      </div>
    {/if}
	</div>

	<a href="/" class="flex-row items-center text-3xl flex gap-x-3 shrink-0">
    <img src="/images/goat.png" class="h-10" alt="Logo" />
    <p class="md:hidden lg:block">
      GoatPit
    </p>
  </a>

  <div class="min-w-[10rem] w-full max-w-[40rem] px-6 hidden md:block"> 
    <NavbarSearch />
  </div>

	<div class="flex flex-row items-center">
		<div class="hidden md:flex md:mr-10 flex-row gap-x-6 text-indigo-12">
      <Link href="/">Home</Link>
      <Link href="/autorank">AutoRank <span class="badge badge-info badge-md">NEW</span></Link>
      <Link href="/">Discover</Link>
    </div>

		{#if $user}
			<ProfileDropdown />
		{:else}
			<LoginButton />
		{/if}
	</div>
</nav>

<style lang="postcss">
	.g-drawer-content {
		background-color: #0a0448;
	}

	.drawer-toggle:checked ~ .is-visible {
		display: flex;
	}

  ul li {
    @apply w-full;
  }
</style>

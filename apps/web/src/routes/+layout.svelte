<script>
  import "../app.css";
  import Navbar from "$lib/components/navbar/Navbar.svelte";
	import LoginModal from "$lib/components/auth/LoginModal.svelte";

  import { page } from '$app/stores';
	import { handleSession } from '@lucia-auth/sveltekit/client';
	import AlertContainer from "$lib/components/alert/AlertContainer.svelte";
	import Footer from "$lib/components/footer/Footer.svelte";
	import NavSidebar from "$lib/components/navbar/NavSidebar.svelte";
  import { browser } from "$app/environment";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      }
    }
  });

	handleSession(page);
</script>

<QueryClientProvider client={queryClient}>
  <div class="test w-full min-h-screen text-indigo-12 flex flex-col">
    <div class="mt-16"></div>
    <Navbar />
    <!-- <NavSidebar /> -->
    <LoginModal />
    <AlertContainer />
    <slot></slot>
    <div class="mt-16"></div>
    <Footer />
  </div>
</QueryClientProvider>


<style lang="postcss">
  .test {
    background-image: 
      radial-gradient( circle 710px at 5.2% calc(100vh),  rgb(4, 7, 97) 0%, transparent 97.5% ),
      /* radial-gradient( circle 610px at 90.2% calc(20vh),  rgba(5,8,114,1) 0%, transparent 97.5% ), */
      /* radial-gradient( circle 610px at 5.2% calc(280vh),  rgba(5,8,114,1) 0%, transparent 97.5% ), */
      radial-gradient( circle 710px at 90.2% calc(20vh),  rgb(4, 7, 97) 0%, rgb(7, 3, 53) 97.5% );

    background-attachment: fixed;
  }
</style>

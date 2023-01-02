<script>
  import "../app.css";
  import Navbar from "$lib/components/navbar/Navbar.svelte";
	import LoginModal from "$lib/components/auth/LoginModal.svelte";

  import { page } from '$app/stores';
	import { handleSession } from '@lucia-auth/sveltekit/client';
	import AlertContainer from "$lib/components/alert/AlertContainer.svelte";
	import Footer from "$lib/components/footer/Footer.svelte";

	handleSession(page);
</script>

<div class="bg-indigo-1 w-full min-h-screen text-indigo-12 flex flex-col">
  <div class="mt-16"></div>
  <Navbar />
  <LoginModal />
  <AlertContainer />
  <slot></slot>
  <div class="mt-16"></div>
  <Footer />
</div>

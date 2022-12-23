<script>
  import "../app.css";
  import Navbar from "$lib/components/navbar/Navbar.svelte";
	import LoginModal from "$lib/components/auth/LoginModal.svelte";

  import { page } from '$app/stores';
	import { handleSession } from '@lucia-auth/sveltekit/client';
	import AlertContainer from "$lib/components/alert/AlertContainer.svelte";

	handleSession(page);
</script>

<div class="bg-indigo-1 min-h-screen h-stretch text-indigo-12">
  <Navbar />
  <LoginModal />
  <AlertContainer />
  <slot></slot>
</div>

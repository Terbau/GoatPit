<script>
	import { invalidateAll } from "$app/navigation";
	import { signOut } from "@lucia-auth/sveltekit/client";

  const handleLogout = async () => {
    console.log("Signing out");
    await signOut();
    invalidateAll();
  };
</script>

<button on:click="{handleLogout}" class="bordered-button-red w-full">
  Logout
</button>
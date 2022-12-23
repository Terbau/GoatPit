<script lang="ts">
	import { loginModalOpen, toggleModal } from "$lib/stores/modal";
</script>

<button on:click="{() => toggleModal(loginModalOpen)}" class="bordered-button-indigo">
  Login
</button>
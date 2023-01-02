<script lang="ts">
	import ErrorAlert from "./ErrorAlert.svelte";
  import SuccessAlert from "./SuccessAlert.svelte";
	import WarningAlert from "./WarningAlert.svelte";
  import InfoAlert from "./InfoAlert.svelte";
  import { alerts } from "$lib/stores/alert";
</script>

<div class="w-1/2 mx-auto {$alerts.length === 0 ? 'h-0' : 'pt-2'}">
  <div class="inverted-stack w-full">
    {#each $alerts as alert}
      {#if alert.type === "error"}
        <ErrorAlert message={alert.message} id={alert.id} />
      {:else if alert.type === "success"}
        <SuccessAlert message={alert.message} id={alert.id} />
      {:else if alert.type === "warning"}
        <WarningAlert message={alert.message} id={alert.id} />
      {:else if alert.type === "info"}
        <InfoAlert message={alert.message} id={alert.id} />
      {/if}
    {/each}
  </div>
</div>
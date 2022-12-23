<script lang="ts">
	import ErrorAlert from "./ErrorAlert.svelte";
  import SuccessAlert from "./SuccessAlert.svelte";
	import WarningAlert from "./WarningAlert.svelte";
  import InfoAlert from "./InfoAlert.svelte";
  import { alerts } from "$lib/stores/alert";
</script>

<div class="w-1/2 mx-auto mt-4 {$alerts.length === 0 ? 'h-0' : ''}">
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

<style lang="postcss">
  :global(.alert) {
    @apply py-3
  }

  :global(.inverted-stack) {
    @apply inline-grid place-items-center items-end;
  }

  :global(.inverted-stack > *) {
    @apply col-start-1 row-start-1 w-full;
    transform: translateY(20%) scale(0.95);
    z-index: 1;
  }

  :global(.inverted-stack > *:nth-last-child(2)) {
    transform: translateY(10%) scale(0.98);
    z-index: 2;
  }

  :global(.inverted-stack > *:nth-last-child(1)) {
    transform: translateY(0) scale(1);
    z-index: 3;
  }

</style>
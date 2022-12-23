<script lang="ts">
  export let error: string | boolean = "";
  export let value = "";
  export let required = false;
</script>

<div class="flex flex-col gap-1">
  <label
    for="input"
    class="text-indigo-11 flex flex-col gap-1"
  >
    <slot />

    <input
      id="input"
      type="text"
      required={required}
      class="bg-indigo-4 text-sm rounded-md px-4 py-3
            focus:outline-none
            {!error ? 'focus:ring-2 focus:ring-indigo-11 focus:ring:opacity-50'
              : 'border border-solid border-red-11 focus:ring-2 focus:ring-red-11 focus:ring:opacity-50'}"
      bind:value={value}
    >
  </label>
  {#if error && typeof error === 'string'}
    <p class="text-red-11 text-sm w-full">{error}</p>
  {/if}
</div>

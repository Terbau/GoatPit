<script lang="ts">
	import Spinner from "../icons/Spinner.svelte";

  export let value = "";
  export let spinning = false;

  export let props = {};
  
</script>

<div class="text-indigo-11">
  <slot />
  <div class="flex flex-row bg-indigo-3 focus-within:ring-2 focus-within:ring-indigo-11 rounded-lg">
    <input
      type="text"
      class="font-normal rounded-lg px-4 py-2 bg-inherit w-full text-indigo-12
             focus:outline-none focus:ring-0"
      bind:value={value}
      on:input
      {...props}
    >
    <div class="w-8 p-1 fill-indigo-9 flex items-center justify-center mr-1">
      {#if spinning}
        <Spinner animated />
      {/if}
    </div>
  </div>
</div>

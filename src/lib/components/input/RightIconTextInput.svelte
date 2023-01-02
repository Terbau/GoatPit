<script lang="ts">
  export let value = "";
  export let props = {};
  export let label = "";
</script>

<div class="text-indigo-11">
  {#if label}
    {label}
  {/if}
  <div class="flex flex-row bg-indigo-3 focus-within:ring-2 focus-within:ring-indigo-11 rounded-lg">
    <input
      type="text"
      class="font-normal rounded-lg px-4 py-2 bg-inherit w-full text-indigo-12
             focus:outline-none focus:ring-0"
      bind:value={value}
      on:input
      on:focusin
      on:focusout
      {...props}
    >
    <div class="w-[2.25rem] p-2 fill-indigo-9 flex items-center justify-center mr-1">
      <slot />
    </div>
  </div>
</div>

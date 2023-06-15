<script lang="ts">
	import { removeAlert } from "$lib/stores/alert";
	import { scale } from "svelte/transition";
	import CloseIcon from "../icons/CloseIcon.svelte";

  export let message: string;
  export let id: number;
  
  let clazz = "";
  export { clazz as class };
</script>

<div transition:scale={{ duration: 200 }} class="alert {clazz} shadow-lg">
  <div class="flex flex-row w-full justify-between">
    <div class="flex flex-row gap-x-2">
      <slot></slot>
      <span>{message}</span>
    </div>
    
    <button class="h-5 w-5 fill-slate-4" on:click={() => removeAlert(id)}>
      <CloseIcon />
    </button>
    
  </div>
</div>
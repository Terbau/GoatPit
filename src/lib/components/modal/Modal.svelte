<script lang="ts">
  import type { Writable } from "svelte/store";
	import { onDestroy } from "svelte";
	import CloseIcon from "../icons/CloseIcon.svelte";
	import { browser } from "$app/environment";

  export let visible = false;
  export let store: Writable<boolean> | null = null;

  export const toggle = () => {
    if (store) {
      store.update((v) => !v);
    } else {
      visible = !visible;
    }
  };

  const unsubscribe = store?.subscribe((v) => {
    visible = v;
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  let classes = 'hidden';
  $: if (browser && visible) {
    classes = '';
  } else if (browser && !visible) {
    classes = 'hidden';
  }
</script>

<div class="cursor-default {classes}">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="z-20 fixed bg-black/50 inset-x-0 inset-y-0"
    on:click|self|stopPropagation="{toggle}"
  ></div>
  <div class="z-20 absolute inset-x-0 inset-y-0 top-[5%] mx-auto w-fit h-fit bg-indigo-2
              rounded-xl border-[6px] border-solid border-indigo-2 max-w-[80%] max-h-[90%]
              overflow-y-auto custom-scrollbar">
    <div class="rounded-xl border-[3px] border-solid border-indigo-4 min-h-[10rem] min-w-[20rem] py-6 px-10">
      <button
        class="w-4 h-4 absolute right-5 top-5 fill-indigo-10 hover:fill-indigo-11"
        on:click|stopPropagation="{toggle}"
      >
        <CloseIcon />
      </button>
      
      <slot></slot>
    </div>
  </div>
</div>

<style lang="postcss">
  /* Firefox */
  /* .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: var(--secondary) var(--primary);
  } */

  /* Chrome, Edge, and Safari */
</style>
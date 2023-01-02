<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import DeleteIcon from '../icons/DeleteIcon.svelte';

	export let visible = false;

	const dispatch = createEventDispatcher();
</script>

{#if visible}
  <div
    class="absolute z-40 w-3/4 h-12 py-2 px-6 rounded-xl bg-slate-3 scale-110 bottom-full top-[-4rem]
           flex flex-row items-center"
  >
    <div class="tooltip ml-auto" data-tip="Delete">
      <button
        class="fill-red-9 hover:fill-red-10 active:fill-red-11"
        on:click={() => dispatch('delete')}
        >
        <DeleteIcon />
      </button>
    </div>
  </div>
{/if}

<style lang="postcss">
	button {
		@apply h-full w-5;
	}

  .tooltip {
    @apply h-full;
  }
</style>

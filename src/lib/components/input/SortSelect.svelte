<script context="module" lang="ts">
	export interface SortOption {
		label: string;
		value: string;
		selected?: boolean;
	}
</script>

<script lang="ts">
	import SortLargeToSmallIcon from '../icons/SortLargeToSmallIcon.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let sortDirection = 'asc';
	export let options: SortOption[] = [];
	export let value = options.find((option) => option.selected)?.value;
  export let loading = false;

	if (!value) {
		value = options[0].value;
		options[0].selected = true;
	}

	const toggleSortDirection = () => {
		sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	};

	const handleSortDirectionButtonClick = () => {
		toggleSortDirection();
		dispatch('sortDirectionChange', sortDirection);
	};
</script>

<div class="flex flex-row w-full justify-end items-center">
  {#if loading}
    <div class="animate-pulse flex flex-row gap-x-2 items-center">
      <div class="h-10 w-10 bg-slate-6 rounded-full"></div>
      <div class="h-12 w-36 bg-slate-6 rounded-xl"></div>
    </div>
  {:else}
    <button
      on:click={handleSortDirectionButtonClick}
      class="p-2 h-11 w-11 fill-slate-9 active:fill-slate-10 {sortDirection == 'desc' ? 'scale-y-[-1]' : ''}"
    >
      <SortLargeToSmallIcon />
    </button>
    <select class="select" bind:value on:change>
      {#each options as option}
        <option value={option.value} selected={option.selected}>
          {option.label}
        </option>
      {/each}
    </select>
  {/if}
</div>

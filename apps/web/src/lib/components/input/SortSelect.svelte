<script context="module" lang="ts">
	export interface SortOption {
		label: string;
		value: string;
		selected?: boolean;
		isReversed?: boolean;
	}
</script>

<script lang="ts">
	import SortLargeToSmallIcon from '../icons/SortLargeToSmallIcon.svelte';
	import { createEventDispatcher } from 'svelte';
	import SortSmallToLargeIcon from '../icons/SortSmallToLargeIcon.svelte';

	const dispatch = createEventDispatcher();

	export let sortDirection = 'asc';
	export let options: SortOption[] = [];
	export let value = options.find((option) => option.selected)?.value;
  export let loading = false;
	export let isCurrentlyReversed = options.find((option) => option.value == value)?.isReversed;

	if (!value) {
		value = options[0].value;
		options[0].selected = true;
	}

	const toggleSortDirection = () => {
		sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	};

	const dispatchSortDirectionChange = (wasReversed: boolean = false) => {
		dispatch('sortDirectionChange', ({
			sortDirection,
			wasReversed,
		}));
	}

	const handleSortDirectionButtonClick = () => {
		toggleSortDirection();
		dispatchSortDirectionChange();
	};

	// const handleReversedSortDirectionAction = (val: string | undefined) => {
	// 	console.log(isCurrentlyReversed)  // FIX THIS
	// 	if (options.find((option) => option.value == val)?.isReversed == isCurrentlyReversed) return;

	// 	toggleSortDirection();
	// 	dispatchSortDirectionChange(true);
	// };

	// $: handleReversedSortDirectionAction(value);
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
      class="p-2 h-11 w-11 fill-slate-9 active:fill-slate-10 {sortDirection == 'asc' ? 'scale-y-[-1]' : ''}"
    >
			{#if !options.find((option) => option.value == value)?.isReversed}
				<SortLargeToSmallIcon />
			{:else}
			  <SortSmallToLargeIcon />
			{/if}
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

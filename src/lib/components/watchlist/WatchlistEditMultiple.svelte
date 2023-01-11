<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import type { ExtendedWatchlistItem } from "$lib/server/watchlist/functions";
	import { addAlert } from "$lib/stores/alert";
	import { activeWatchlistId, isEditingItems, removeFromWatchlist, selectedItemIds } from "$lib/stores/watchlist";
	import { createEventDispatcher } from "svelte";
	import type { Writable } from "svelte/store";
	import DeleteIcon from "../icons/DeleteIcon.svelte";
	import RegularEditIcon from "../icons/RegularEditIcon.svelte";
	import SolidEditIcon from "../icons/SolidEditIcon.svelte";

  export let loading = false;
  export let items: Writable<ExtendedWatchlistItem[]>;

  const handleDeleteClick = async () => {
    if (!browser) return;

		const itemIds = [...$selectedItemIds];
    if (itemIds.length === 0) return;

		const resp = await fetch(`/api/user/${$page.params.userId}/watchlist/${$activeWatchlistId}/items`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(itemIds)
		});

		if (resp.status === 200) {
			const respData = await resp.json();

			removeFromWatchlist(respData.deletedItemIds);
      selectedItemIds.update((lst) => lst.filter((id) => !respData.deletedItemIds.includes(id)))
      isEditingItems.set(false);
      // dispatch('delete', respData.deletedItemIds)
			addAlert({
				message: `Successfully deleted ${respData.deletedItemIds.length} items from your watchlist.`,
				type: 'success'
			});
		} else {
			addAlert({
				message: 'Failed to delete item from watchlist.',
				type: 'error'
			});
		}
  };
</script>

<div class="flex flex-row items-end h-full gap-x-6 grow {loading ? 'invisible' : ''}">
  <div
    class="tooltip flex mt-auto {$isEditingItems ? 'tooltip-left' : 'tooltip-left'}"
    data-tip="Edit items"
  >
    <button
      class="h-[2.5rem] w-[2.5rem] ml-2 {$isEditingItems
        ? 'fill-indigo-11'
        : 'fill-slate-9'}"
      on:click={() => {
        isEditingItems.update((value) => !value);
      }}
    >
      {#if $isEditingItems}
        <SolidEditIcon />
      {:else}
        <RegularEditIcon />
      {/if}
    </button>
  </div>

  {#if $isEditingItems}
    <div class="flex flex-col gap-y-1">
      <p class="text-sm text-slate-9 whitespace-nowrap">Selected {$selectedItemIds.length} of {$items.length}</p>

      <div class="flex flex-row gap-x-2">
        <input
          type="checkbox"
          class="checkbox checkbox-primary"
          checked={$selectedItemIds.length === $items.length}
          on:change={() => {
            if ($selectedItemIds.length === $items.length) {
              selectedItemIds.set([]);
            } else {
              selectedItemIds.set($items.map((item) => item.id));
            }
          }}
        />
        <span class="whitespace-nowrap">Select all</span>
      </div>
      
    </div>

    <div class="dropdown dropdown-hover dropdown-bottom mt-auto box-content translate-y-[0.25rem] z-30">
      <label tabindex="-1" for="" class="mb-1 btn bg-base-100 hover:bg-base-200">Actions</label>
      <ul tabindex="-1" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        <!-- <li>
          <button>Test</button>
        </li> -->
        <li>
          <button on:click={handleDeleteClick}>
            <div>
              <DeleteIcon />
            </div>
            <span>Delete</span>
          </button>
        </li>
      </ul>
    </div>
  {/if}
</div>

<style lang="postcss">
	.dropdown-content li button {
		@apply inline-flex items-center w-full;
	}

	.dropdown-content li button div {
		@apply h-6 w-6 fill-red-10;
	}

	.dropdown-content li button span {
		@apply mt-1;
	}
</style>
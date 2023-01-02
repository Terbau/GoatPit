import { browser } from '$app/environment';
import type { ExtendedWatchlistItem } from '$lib/server/functions';
import { writable, type Writable } from "svelte/store";

export const defaultWatchlist: Writable<ExtendedWatchlistItem[]> = writable([]);

export const activeWatchlistUserId = writable("");
export const watchlistItemIsHighlighted = writable(false);

const initialSortDirectionValue = browser ? window.localStorage.getItem("watchlistSortDirection") || "asc": "asc";
export const watchlistSortDirection = writable(initialSortDirectionValue);
const initialSortOptionValue = browser ? window.localStorage.getItem("watchlistSortOption") || "added": "added";
export const watchlistSortOption = writable(initialSortOptionValue);

watchlistSortDirection.subscribe((value) => {
  if (browser) {
    console.log("storing")
    window.localStorage.setItem("watchlistSortDirection", value);
  }
});

watchlistSortOption.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem("watchlistSortOption", value);
  }
});

export const appendToWatchlist = (items: ExtendedWatchlistItem[]) => {
  if (items.length === 0) return;

  defaultWatchlist.update((currentItems) => {
    return [...currentItems, ...items];
  });
}

export const prependToWatchlist = (items: ExtendedWatchlistItem[]) => {
  if (items.length === 0) return;

  defaultWatchlist.update((currentItems) => {
    return [...items, ...currentItems];
  });
}

export const removeFromWatchlist = (watchlistItemIds: string[]) => {
  defaultWatchlist.update((items) => {
    return items.filter((item) => !watchlistItemIds.includes(item.id as any));
  });
}
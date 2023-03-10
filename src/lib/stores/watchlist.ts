import { browser } from '$app/environment';
import type { ExtendedWatchlistItem } from '$lib/server/watchlist/types';
import { writable, type Writable } from "svelte/store";

export const watchlistItems: Writable<ExtendedWatchlistItem[]> = writable([]);
export const watchlistIsLoading = writable(true);
export const watchlistSearchKeyword = writable("");

export const activeWatchlistId = writable("");
export const activeWatchlistUserId = writable("");
export const watchlistItemIsHighlighted = writable(false);

export const isEditingItems = writable(false);
export const selectedItemIds = writable<string[]>([]);

const initialWatchlistActiveGenresValue: {[genre: string]: boolean} = browser ? JSON.parse(window.localStorage.getItem("watchlistActiveGenres") || "{}") : {};
export const watchlistActiveGenres = writable<{[genre: string]: boolean}>(initialWatchlistActiveGenresValue);

const initialSortDirectionValue = browser ? window.localStorage.getItem("watchlistSortDirection") || "desc": "desc";
export const watchlistSortDirection = writable(initialSortDirectionValue);
const initialSortOptionValue = browser ? window.localStorage.getItem("watchlistSortOption") || "addedAt": "addedAt";
export const watchlistSortOption = writable(initialSortOptionValue);

watchlistActiveGenres.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem("watchlistActiveGenres", JSON.stringify(value));
  }
});

watchlistSortDirection.subscribe((value) => {
  if (browser) {
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

  watchlistItems.update((currentItems) => {
    return [...currentItems, ...items];
  });
}

export const prependToWatchlist = (items: ExtendedWatchlistItem[]) => {
  if (items.length === 0) return;

  watchlistItems.update((currentItems) => {
    return [...items, ...currentItems];
  });
}

export const removeFromWatchlist = (watchlistItemIds: string[]) => {
  watchlistItems.update((items) => {
    return items.filter((item) => !watchlistItemIds.includes(item.id as any));
  });
}
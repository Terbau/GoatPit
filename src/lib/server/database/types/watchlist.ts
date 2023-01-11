import type { Generated } from "kysely";

export interface Watchlist {
  id: Generated<string>;
  name: string;
  description: string;
  isPublic: boolean;
  isDefaultWatchlist: boolean;
  isDefaultTowatchlist: boolean;
  userId: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface WatchlistItem {
  id: Generated<string>;
  watchlistId: string;
  imdbItemId: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}
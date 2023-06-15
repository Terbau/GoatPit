import type { IMDBItem } from "$lib/server/database/types/imdb";
import type { ItemElo } from "$lib/server/database/types/eloranking";

export interface ReadableItemElo extends ItemElo {
  eloRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadableImdbItem extends IMDBItem {
  createdAt: Date;
  updatedAt: Date;
}
import { IMDBItem } from '../database/types/imdb';
import { Watchlist as DBWatchlist, WatchlistItem } from '../database/types/watchlist';

export interface ExtendedIMDBItem extends IMDBItem {
	creators: IMDBCreator[];
	genres: IMDBGenre[];
	stars: IMDBStar[];
	eloRating: number | null;
	// eloPercentage: number | null;  // how close the rating is to the max rating currently in the database
	requestersEloRating: number | null;
	// requestersEloPercentage: number | null;  // how close the rating is to the max rating currently in the database
}

export interface ExtendedWatchlistItem extends Omit<WatchlistItem, 'id'> {
	id: string;
	item: ExtendedIMDBItem;
}

export interface WatchlistUser {
	email: string;
	id: string;
}

export interface ReadableDBWatchlist extends Omit<DBWatchlist, 'id' | 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtendedWatchlist extends ReadableDBWatchlist{
	items: ExtendedWatchlistItem[];
	user: WatchlistUser;
}

export interface GetItemsOptions {
	itemIds?: string[] | undefined;
	imdbItemIds?: string[] | undefined;
	orderBy?: string | undefined;
	orderDirection?: string | undefined;
}
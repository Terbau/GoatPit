import type { Watchlist, WatchlistItem } from './watchlist';
import type { IMDBGenre, IMDBStarFilmography, IMDBStar, IMDBItem, IMDBItemGenre, IMDBCreator, IMDBCreatorFilmography } from "./imdb";
import type { Session, User } from "./user";
import type { ItemElo, ItemEloMatchup } from './eloranking';

export interface Database {
  user: User;
  session: Session;
  imdbCreator: IMDBCreator;  // Also known as directors some times
  imdbStar: IMDBStar;
  imdbCreatorFilmography: IMDBCreatorFilmography;
  imdbStarFilmography: IMDBStarFilmography;
  imdbGenre: IMDBGenre;
  imdbItem: IMDBItem;
  imdbItemGenre: IMDBItemGenre;
  watchlist: Watchlist;
  watchlistItem: WatchlistItem;
  itemElo: ItemElo;
  itemEloMatchup: ItemEloMatchup;
}
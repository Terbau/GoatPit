export interface ImageData {
  height: number;
  imageUrl: string;
  width: number;
}

export interface PosterData {
  height: number;
  url: string;
  width: number;
}

export interface RawSearchResultEntry {
  i?: ImageData;  // image data
  id: string;  // imdb id
  l: string;  // title
  q?: string;  // some title? ("TV Series", "feature")
  qid: "tvSeries" | "movie";  // type
  rank?: number;  // rank??
  s?: string;  // highlighted actors
  y?: number;  // year released
  yr?: string;  // years a tvseries was running [only included after series end] (e.g. "2020-2023")
}

export interface SearchResultEntry {
  id: string;
  title: string;
  type: "tvSeries" | "movie";
  yearReleased?: number;
  yearsRunning?: string;
  image: ImageData | null;
  rank?: number;
  highlightedActors?: string;
}

export interface SearchResultMovie extends SearchResultEntry {
  type: "movie";
}

export interface SearchResultTVSeries extends SearchResultEntry {
  type: "tvSeries";
}


// Watchlist stuff

export interface Creator {
  id: string;
  name: string;
}

export interface Star {
  id: string;
  name: string;
}

export interface Stats {
  starRating: number;
  movieMeterRank: number;
  votes: number;
}

export interface Item {
  id: string;
  title: string;
  plot: string;
  runtime: number;
  yearReleased: number | null;
  yearEnded: number | null;
  releasedAt: Date;
  numberOfEpisodes: number;
  genres: string[],
  certificate: string;
  stats: Stats;
  creators: Creator[];
  stars: Star[];
  poster: PosterData | null;
  type: "movie" | "series";
}

export interface LookupResult {
  [id: string]: Item;
}

export interface RawWatchlistItem {
  position: number;
  addedAt: Date;
  id: string;
  description: {html: string};
  imdbItemId: string;  // The actual movie/series id
}

export interface WatchlistItem extends RawWatchlistItem {
  item: Item;
} 

export interface WatchlistItems {
  [id: string]: WatchlistItem;
}

import { convertFromRawEntry, convertMovie, convertSeries, parseDate } from './utils';
import { SearchResultEntry, RawSearchResultEntry, SearchResultMovie, SearchResultTVSeries, WatchlistItem, Item, LookupResult, RawWatchlistItem, WatchlistItems } from './types';


export async function searchRaw(query: string): Promise<RawSearchResultEntry[]> {
  const encoded = encodeURIComponent(query);
  const response = await fetch(
    `https://v3.sg.media-imdb.com/suggestion/x/${encoded}.json?`,
  );

  const data = await response.json();
  return data.d;
}

export async function search(query: string): Promise<SearchResultEntry[]> {
  const data = await searchRaw(query);
  return data
    .filter((item: RawSearchResultEntry) => ['tvSeries', 'movie'].includes(item.qid))
    .map((item: RawSearchResultEntry) => convertFromRawEntry(item));
}
  
export async function searchMovie(query: string): Promise<SearchResultMovie[]> {
  const data = await search(query);
  const filteredData = data.filter((item: SearchResultEntry) => item.type === 'movie');
  return filteredData as SearchResultMovie[];
}

export async function searchTVSeries(query: string): Promise<SearchResultTVSeries[]> {
  const data = await search(query);
  const filteredData = data.filter((item: SearchResultEntry) => item.type === 'tvSeries');
  return filteredData as SearchResultTVSeries[];
}

export async function getItemsByIds(ids: string[]): Promise<LookupResult> {
  if (ids.length === 0) {
    return {}
  }

  const response = await fetch(
    `https://www.imdb.com/title/data?ids=${ids.join(',')}`,
    {
      headers: {
        'Accept-Language': 'en-US'
      }
    }
  );
  const data: Object = await response.json();

  const newItems: LookupResult = {};
  for (const obj of Object.values(data)) {
    if (obj.title.type === "featureFilm") {
      const movie = convertMovie(obj);
      newItems[movie.id] = movie;
    } else if (obj.title.type === "series") {
      const series = convertSeries(obj);
      newItems[series.id] = series;
    }
  }

  return newItems;
}

export async function getMoviesByIds(ids: string[]): Promise<LookupResult> {
  const result = await getItemsByIds(ids);
  
  const movies: LookupResult = {};
  for (const id in Object.values(result)) {
    if (result[id].type === "movie") {
      movies[id] = result[id];
    }
  }

  return movies;
}

export async function getSeriesByIds(ids: string[]): Promise<LookupResult> {
  const result = await getItemsByIds(ids);
  
  const series: LookupResult = {};
  for (const id in Object.values(result)) {
    if (result[id].type === "series") {
      series[id] = result[id];
    }
  }

  return series;
}

export async function getRawWatchlistByUserId(userId: string): Promise<RawWatchlistItem[]> {
  const response = await fetch(
    `https://www.imdb.com/user/${userId}/watchlist`,
  );

  const rawText = await response.text();
  const matches = rawText.match(/IMDbReactInitialState.push\((.*)\);/);
  if (!matches) {
    throw new Error('Unable to parse watchlist');
  }

  const data = JSON.parse(matches[1]);
  return data.list.items.map((item: any) => ({
    imdbItemId: item.const,
    id: item.itemId,
    description: item.description,
    addedAt: parseDate(item.added),
    position: item.position,
  }));
}

export async function getWatchlistByUserId(userId: string): Promise<WatchlistItems> {
  const data = await getRawWatchlistByUserId(userId);
  const ids = data.map((item: RawWatchlistItem) => item.imdbItemId);
  const items = await getItemsByIds(ids);

  const lookup: {[id: string]: RawWatchlistItem} = {};
  for (const item of data) {
    lookup[item.imdbItemId] = item;
  }

  const newItems: WatchlistItems = {};
  for (const item of data) {
    newItems[item.id] = {
      ...item,
      item: items[item.imdbItemId],
    };
  }

  return newItems;
}


// export async function getOldWatchlistByUserId(userId: string): Promise<WatchListItem[]> {
//   const data: Object = await getRawWatchlistByUserId(userId);

//   const newData: WatchListItem[] = [];
//   for (const obj of Object.values(data)) {
//     if (obj.title.type !== "featureFilm") continue;

//     const movie: WatchListItem = {
//       id: obj.title.id,
//       title: obj.title.primary.title,
//       plot: obj.title.plot,
//       runtime: obj.title.metadata.runtime,
//       yearReleased: parseInt(obj.title.primary.year[0]),
//       dateReleased: obj.title.metadata.release,
//       genres: obj.title.metadata.genres,
//       certificate: obj.title.metadata.certificate,
//       stats: {
//         starRating: obj.starbar.aggregate,
//         movieMeterRank: obj.title.movieMeterCurrentRank,
//         votes: obj.starbar.votes,
//       },
//       directors: obj.title.credits.directors.map((d: any) => ({
//         id: d.href.split('/')[2],
//         name: d.name,
//       })),
//       stars: obj.title.credits.stars.map((s: any) => ({
//         id: s.href.split('/')[2],
//         name: s.name,
//       })),
//       poster: obj.title.poster,
//     }
//     newData.push(movie)
//   }

//   return newData;
// }


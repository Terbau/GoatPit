import { getItemsByIds, search, type Item, type LookupResult, type SearchResultEntry } from '@goatpit/imdb';
import { sql } from "kysely";
import { db } from "./database";
import type { IMDBCreator, IMDBGenre, IMDBItem, IMDBStar } from './database/types/imdb';
import type { WatchlistItem } from "./database/types/watchlist";

export interface ExtendedIMDBItem extends IMDBItem {
  creators: IMDBCreator[];
  genres: IMDBGenre[];
  stars: IMDBStar[];
}

export interface ExtendedWatchlistItem extends WatchlistItem {
  item: ExtendedIMDBItem;
}

interface QueryResult {
  id: string;
  items: ExtendedWatchlistItem[];
}

interface GetItemsOptions {
  itemIds?: string[] | undefined;
  imdbItemIds?: string[] | undefined;
}

// Custom exception
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export const getDefaultWatchlistItemsByUserId = async (userId: string, options: GetItemsOptions = {}): Promise<ExtendedWatchlistItem[]> => {
  let toCheck = sql``;
  if (options.itemIds && options.imdbItemIds) {
    toCheck = sql`AND (watchlist_item.id IN (${sql.join(options.itemIds)}) OR imdb_item.id IN (${sql.join(options.imdbItemIds)}))`
  } else if (options.itemIds) {
    toCheck = sql`AND watchlist_item.id IN (${sql.join(options.itemIds)})`
  } else if (options.imdbItemIds) {
    toCheck = sql`AND imdb_item.id IN (${sql.join(options.imdbItemIds)})`
  }

  const statement = sql<QueryResult>`
    WITH s AS (
      SELECT COALESCE(json_agg(res) FILTER (WHERE res.id IS NOT NULL)) AS items
      FROM (
        SELECT watchlist_item.*, (
          SELECT item FROM (
            SELECT imdb_item.*,
            (
              SELECT
              COALESCE(json_agg(imdb_creator) FILTER (WHERE imdb_creator.id IS NOT NULL), '[]')
              FROM imdb_creator_filmography
              LEFT JOIN imdb_creator ON imdb_creator_filmography.creator_id = imdb_creator.id
              WHERE imdb_creator_filmography.item_id = imdb_item.id
            ) AS creators,
            (
              SELECT
              COALESCE(json_agg(imdb_star) FILTER (WHERE imdb_star.id IS NOT NULL), '[]')
              FROM imdb_star_filmography
              LEFT JOIN imdb_star ON imdb_star_filmography.star_id = imdb_star.id
              WHERE imdb_star_filmography.item_id = imdb_item.id
            ) AS stars,
            (
              SELECT
              COALESCE(json_agg(imdb_genre) FILTER (WHERE imdb_genre.name IS NOT NULL), '[]')
              FROM imdb_item_genre
              LEFT JOIN imdb_genre ON imdb_item_genre.genre_name = imdb_genre.name
              WHERE imdb_item_genre.item_id = imdb_item.id
            ) AS genres
          ) AS item
        )
        FROM watchlist
        LEFT JOIN watchlist_item ON watchlist.id = watchlist_item.watchlist_id
        LEFT JOIN imdb_item ON watchlist_item.imdb_item_id = imdb_item.id
        WHERE watchlist.user_id = ${userId} AND watchlist.is_default = true ${toCheck}
        GROUP BY watchlist_item.id, imdb_item.id
        ORDER BY watchlist_item.created_at DESC
      ) AS res
    ), i AS (
      INSERT INTO watchlist (user_id, is_default, name) 
      SELECT ${userId}, true, 'Default Watchlist'
      WHERE NOT EXISTS (SELECT 1 FROM s)
      RETURNING '[]'::JSON AS items
    )
    SELECT items FROM s
    UNION ALL
    SELECT items FROM i`;
  
  try {
    const { rows } = await statement.execute(db);
    // console.log(JSON.stringify(rows[0].items ?? [], null, 2))
    return rows[0].items ?? [];
  }
  catch (err) {
    const { message } = err as Error;
    console.log(message)
    if (message.includes("invalid input syntax for type uuid")
        || message.includes("watchlist_user_id_fkey")) {
      throw new NotFoundError("User not found");
    }

    throw err;
  }
}

export const addIMDBItemsIfNotExists = async (userId: string, itemIds: string[]): Promise<string[]> => {
  if (itemIds.length <= 0) return [];

  const imdbItems = await db
    .selectFrom("imdbItem")
    .select("id")
    .where("id", "in", itemIds)
    .execute();

  const existingItemIds = imdbItems.map((item) => item.id);
  const missingItemIds = itemIds.filter((id) => !existingItemIds.includes(id));

  // Maybe change it to request all movies if we already have to request at least
  // one. Then we can update duplicates.
  // EDIT: Then we also have to check all the other tables for duplicates.
  const itemsCollection: LookupResult = await getItemsByIds(missingItemIds);
  const items = Object.values(itemsCollection);

  if (items.length > 0) {
    await db
      .insertInto("imdbItem")
      .values(items.map((item) => ({
        id: item.id,
        title: item.title,
        plot: item.plot,
        runtime: item.runtime,
        yearReleased: item.yearReleased,
        yearEnded: item.yearEnded,
        releasedAt: item.releasedAt,
        numberOfEpisodes: item.numberOfEpisodes,
        certificate: item.certificate,
        starRating: item.stats.starRating,
        votes: item.stats.votes,
        imageUrl: item.poster?.url ?? "",
        type: item.type,
      })))
      .execute();

    // Ignore on conflict this time since we already have all the api data we need
    const genres: {[name: string]: {name: string}} = {};
    const itemGenres: {itemId: string, genreName: string}[] = [];

    const stars: {[id: string]: {id: string, name: string}} = {};
    const starFilmography: {itemId: string, starId: string}[] = [];

    const creators: {[id: string]: {id: string, name: string}} = {};
    const creatorFilmography: {itemId: string, creatorId: string}[] = [];

    items.forEach((item) => {
      item.genres.forEach((genre) => {
        genres[genre] = {
          name: genre,
        };

        itemGenres.push({
          itemId: item.id,
          genreName: genre,
        });
      });

      item.stars.forEach((star) => {
        stars[star.id] = {
          id: star.id,
          name: star.name,
        };

        starFilmography.push({
          itemId: item.id,
          starId: star.id,
        });
      });

      item.creators.forEach((creator) => {
        creators[creator.id] = {
          id: creator.id,
          name: creator.name,
        };

        creatorFilmography.push({
          itemId: item.id,
          creatorId: creator.id,
        });
      });
    });

    const genrePromise = async () => {
      await db
        .insertInto("imdbGenre")
        .values(Object.values(genres))
        .onConflict((oc) => oc
          .column("name")
          .doNothing()
        )
        .execute();

      await db
        .insertInto("imdbItemGenre")
        .values(itemGenres)
        .execute();
    };

    const starPromise = async () => {
      await db
        .insertInto("imdbStar")
        .values(Object.values(stars))
        .onConflict((oc) => oc
          .column("id")
          .doNothing()
        )
        .execute();

      await db
        .insertInto("imdbStarFilmography")
        .values(starFilmography)
        .execute();
    };

    const creatorPromise = async () => {
      await db
        .insertInto("imdbCreator")
        .values(Object.values(creators))
        .onConflict((oc) => oc
          .column("id")
          .doNothing()
        )
        .execute();

      await db
        .insertInto("imdbCreatorFilmography")
        .values(creatorFilmography)
        .execute();
    };

    await Promise.all([
      genrePromise(),
      starPromise(),
      creatorPromise(),
    ]);
  }

  return items
    .map((item) => item.id)
    .concat(existingItemIds);
}

export const addItemsToDefaultWatchlistIfNotExists = async (
  userId: string,
  itemIds: string[],
): Promise<ExtendedWatchlistItem[]> => {
  // Make sure all the items exist in the database
  const addedItemIds = await addIMDBItemsIfNotExists(userId, itemIds);

  const name = "Default Watchlist";
  const statement = sql<{id: string}>`
    WITH s AS (
      SELECT id FROM watchlist
      WHERE user_id = ${userId} AND is_default = true
    ), i AS (
      INSERT INTO watchlist (user_id, is_default, name)
      SELECT ${userId}, true, ${name}
      WHERE NOT EXISTS (SELECT 1 FROM s)
      RETURNING id
    )
    SELECT id FROM s
    UNION ALL
    SELECT id FROM i`;
  const queryResult = await statement.execute(db);
  const watchlistId = queryResult.rows[0].id;

  const newItems: {imdbItemId: string, watchlistId: string}[] = addedItemIds.map((itemId) => ({
    imdbItemId: itemId,
    watchlistId,
  }));

  if (newItems.length > 0) {
    await db
      .insertInto("watchlistItem")
      .values(newItems)
      .execute();
  }

  const result = await getDefaultWatchlistItemsByUserId(userId, {
    imdbItemIds: addedItemIds, 
  });
  return result;
}

export const deleteItemsFromDefaultWatchlist = async (
  itemIds: string[],
): Promise<string[]> => {
  const deletedItemIds = await db
    .deleteFrom("watchlistItem")
    .where("id", "in", itemIds)
    .returning("id")
    .execute();
  
  return deletedItemIds.map((row) => row.id);
}

export const searchIMDB = async (query: string): Promise<SearchResultEntry[]> => {
  const result = await search(query);
  return result;
}
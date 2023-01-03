import {
	getItemsByIds,
	search,
	type LookupResult,
	type SearchResultEntry
} from '@goatpit/imdb';
import { sql } from 'kysely';
import { db } from './database';
import type { Watchlist as DBWatchlist } from './database/types/watchlist';
import type { IMDBCreator, IMDBGenre, IMDBItem, IMDBStar } from './database/types/imdb';
import type { WatchlistItem } from './database/types/watchlist';

export interface ExtendedIMDBItem extends IMDBItem {
	creators: IMDBCreator[];
	genres: IMDBGenre[];
	stars: IMDBStar[];
	eloRating: number | null;
	requestersEloRating: number | null;
}

export interface ExtendedWatchlistItem extends WatchlistItem {
	item: ExtendedIMDBItem;
}

export interface ExtendedWatchlist extends Omit<DBWatchlist, 'id' | 'createdAt' | 'updatedAt'> {
	items: ExtendedWatchlistItem[];
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface GetItemsOptions {
	itemIds?: string[] | undefined;
	imdbItemIds?: string[] | undefined;
	orderBy?: string | undefined;
	orderDirection?: string | undefined;
}

// Custom exception
class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NotFoundError';
	}
}

export const getDefaultWatchlistByUserId = async (
	userId: string,
	requesterUserId: string,
	options: GetItemsOptions = {}
): Promise<ExtendedWatchlist> => {
	let orderBy: string;
	switch (options.orderBy) {
		case 'eloRating':
			orderBy = 'itemElo.eloRating';
			break;
		case 'requesterEloRating':
			orderBy = 'requestersElo.eloRating';
			break;
		case 'title':
			orderBy = 'imdbItem.title';
			break;
		case 'year':
			orderBy = 'imdbItem.year';
			break;
		case 'releaseDate':
			orderBy = 'imdbItem.releasedAt';
			break;
		case 'runtime':
			orderBy = 'imdbItem.runtime';
			break;
		case 'imdbRating':
			orderBy = 'imdbItem.starRating';
			break;
		default:
			orderBy = 'watchlistItem.createdAt';
	}

	let orderDirection: 'asc' | 'desc';
	switch (options.orderDirection?.toLowerCase()) {
		case 'asc':
			orderDirection = 'asc';
			break;
		default:
			orderDirection = 'desc';
	}

	const promise = db
		.with('swatchlist', (sw) =>
			sw
				.selectFrom('watchlist')
				.selectAll()
				.where('userId', '=', userId)
				.where('isDefault', '=', true)
		)
		.with('s', (s) =>
			s
				.selectFrom((ec) =>
					ec
						.selectFrom('swatchlist')
						.innerJoin('watchlistItem', 'swatchlist.id', 'watchlistItem.watchlistId')
						.innerJoin('imdbItem', 'watchlistItem.imdbItemId', 'imdbItem.id')
						.leftJoin('itemElo', (elo) =>
							elo.onRef('imdbItem.id', '=', 'itemElo.imdbItemId').on('itemElo.userId', '=', userId)
						)
						.leftJoin('itemElo as requestersElo', (elo) =>
							elo
								.onRef('imdbItem.id', '=', 'requestersElo.imdbItemId')
								.on('requestersElo.userId', '=', requesterUserId)
						)
						.selectAll('watchlistItem')
						.select((qb) =>
							qb
								.selectFrom((qt) =>
									qt
										.selectFrom(sql`(values (1))`.as('t')) // Hacky solution since kysely wants a FROM
										.selectAll('imdbItem')
										.select(['itemElo.eloRating', 'requestersElo.eloRating as requestersEloRating'])
										.select((iq) =>
											iq
												.selectFrom('imdbCreatorFilmography')
												.leftJoin(
													'imdbCreator',
													'imdbCreatorFilmography.creatorId',
													'imdbCreator.id'
												)
												.whereRef('imdbCreatorFilmography.itemId', '=', 'imdbItem.id')
												.select(
													sql<
														IMDBCreator[]
													>`COALESCE(json_agg(imdb_creator) FILTER (WHERE imdb_creator.id IS NOT NULL), '[]')`.as(
														'creators'
													)
												)
												.as('creators')
										)
										.select((iq) =>
											iq
												.selectFrom('imdbStarFilmography')
												.leftJoin('imdbStar', 'imdbStarFilmography.starId', 'imdbStar.id')
												.whereRef('imdbStarFilmography.itemId', '=', 'imdbItem.id')
												.select(
													sql<
														IMDBStar[]
													>`COALESCE(json_agg(imdb_star) FILTER (WHERE imdb_star.id IS NOT NULL), '[]')`.as(
														'stars'
													)
												)
												.as('stars')
										)
										.select((iq) =>
											iq
												.selectFrom('imdbItemGenre')
												.leftJoin('imdbGenre', 'imdbItemGenre.genreName', 'imdbGenre.name')
												.whereRef('imdbItemGenre.itemId', '=', 'imdbItem.id')
												.select(
													sql<
														IMDBGenre[]
													>`COALESCE(json_agg(imdb_genre) FILTER (WHERE imdb_genre.name IS NOT NULL), '[]')`.as(
														'genres'
													)
												)
												.as('genres')
										)
										.as('item')
								)
								.select(sql<ExtendedIMDBItem>`item`.as('item'))
								.as('item')
						)
						.if(!!(options.itemIds && options.imdbItemIds), (q) =>
							q.where((iq) =>
								iq
									.where('watchlistItem.id', 'in', options.itemIds ?? [])
									.orWhere('imdbItem.id', 'in', options.imdbItemIds ?? [])
							)
						)
						.if(!!(options.itemIds && !options.imdbItemIds), (q) =>
							q.where('watchlistItem.id', 'in', options.itemIds ?? [])
						)
						.if(!!(options.imdbItemIds && !options.itemIds), (q) =>
							q.where('imdbItem.id', 'in', options.imdbItemIds ?? [])
						)
						.groupBy([
							'watchlistItem.id',
							'imdbItem.id',
							'itemElo.eloRating',
							'requestersElo.eloRating'
						])
						.orderBy(db.dynamic.ref(orderBy), orderDirection)
						.modifyEnd(sql`NULLS LAST`)
						.as('res')
				)
				.select(
					sql<
						ExtendedWatchlistItem[]
					>`COALESCE(json_agg(res) FILTER (WHERE res.id IS NOT NULL))`.as('items')
				)
		)
		.with('i', (i) =>
			i
				.insertInto('watchlist')
				.columns(['userId', 'isDefault', 'name'])
				.expression((qb) =>
					qb
						.selectFrom(sql`(values (1))`.as('t'))
						.select(sql`${userId}`.as('userId'))
						.select(sql`true`.as('isDefault'))
						.select(sql`'Default Watchlist'`.as('name'))
						.whereNotExists((iqb) => iqb.selectFrom('swatchlist').select('id'))
				)
				.returningAll()
				.returning(sql<ExtendedWatchlistItem[]>`'[]'::JSON`.as('items'))
		)
		.selectFrom([
      'swatchlist',
			(qb) =>
				qb
					.selectFrom('s')
					.select('s.items')
					.unionAll(qb.selectFrom('i').select('i.items'))
					.as('items'),
		])
		.selectAll('swatchlist')
    .select(sql<ExtendedWatchlistItem[]>`COALESCE(items.items, '[]')`.as('items'))
		.executeTakeFirstOrThrow();

	try {
		const row = await promise;
    console.log(JSON.stringify(row, null, 2))
		return row;
	} catch (err) {
		const { message } = err as Error;
		console.log(message);
		if (
			message.includes('invalid input syntax for type uuid') ||
			message.includes('watchlist_user_id_fkey')
		) {
			throw new NotFoundError('User not found');
		}

		throw err;
	}
};

export const getDefaultWatchlistItemsByUserId = async (
	userId: string,
	requesterUserId: string,
	options: GetItemsOptions = {}
): Promise<ExtendedWatchlistItem[]> => {
	const watchlist = await getDefaultWatchlistByUserId(userId, requesterUserId, options);

	return watchlist?.items || [];
};

export const addIMDBItemsIfNotExists = async (itemIds: string[]): Promise<string[]> => {
	if (itemIds.length <= 0) return [];

	// TODO: FIX IMPORT DUPLICATES

	const imdbItems = await db
		.selectFrom('imdbItem')
		.select('id')
		.where('id', 'in', itemIds)
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
			.insertInto('imdbItem')
			.values(
				items.map((item) => ({
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
					imageUrl: item.poster?.url ?? '',
					type: item.type
				}))
			)
			.execute();

		// Ignore on conflict this time since we already have all the api data we need
		const genres: { [name: string]: { name: string } } = {};
		const itemGenres: { itemId: string; genreName: string }[] = [];

		const stars: { [id: string]: { id: string; name: string } } = {};
		const starFilmography: { itemId: string; starId: string }[] = [];

		const creators: { [id: string]: { id: string; name: string } } = {};
		const creatorFilmography: { itemId: string; creatorId: string }[] = [];

		items.forEach((item) => {
			item.genres.forEach((genre) => {
				genres[genre] = {
					name: genre
				};

				itemGenres.push({
					itemId: item.id,
					genreName: genre
				});
			});

			item.stars.forEach((star) => {
				stars[star.id] = {
					id: star.id,
					name: star.name
				};

				starFilmography.push({
					itemId: item.id,
					starId: star.id
				});
			});

			item.creators.forEach((creator) => {
				creators[creator.id] = {
					id: creator.id,
					name: creator.name
				};

				creatorFilmography.push({
					itemId: item.id,
					creatorId: creator.id
				});
			});
		});

		const genrePromise = async () => {
			await db
				.insertInto('imdbGenre')
				.values(Object.values(genres))
				.onConflict((oc) => oc.column('name').doNothing())
				.execute();

			await db.insertInto('imdbItemGenre').values(itemGenres).execute();
		};

		const starPromise = async () => {
			await db
				.insertInto('imdbStar')
				.values(Object.values(stars))
				.onConflict((oc) => oc.column('id').doNothing())
				.execute();

			await db.insertInto('imdbStarFilmography').values(starFilmography).execute();
		};

		const creatorPromise = async () => {
			await db
				.insertInto('imdbCreator')
				.values(Object.values(creators))
				.onConflict((oc) => oc.column('id').doNothing())
				.execute();

			await db.insertInto('imdbCreatorFilmography').values(creatorFilmography).execute();
		};

		await Promise.all([genrePromise(), starPromise(), creatorPromise()]);
	}

	return items.map((item) => item.id).concat(existingItemIds);
};

export const addItemsToDefaultWatchlistIfNotExists = async (
	userId: string,
	itemIds: string[]
): Promise<ExtendedWatchlistItem[]> => {
	// Make sure all the items exist in the database
	const addedItemIds = await addIMDBItemsIfNotExists(itemIds);

	const promise = db
		.with('s', (s) =>
			s
				.selectFrom('watchlist')
				.select('id')
				.where('userId', '=', userId)
				.where('isDefault', '=', true)
		)
		.with('i', (i) =>
			i
				.insertInto('watchlist')
				.columns(['userId', 'isDefault', 'name'])
				.expression((qb) =>
					qb
						.selectFrom(sql`(values (1))`.as('t'))
						.select(sql`${userId}`.as('userId'))
						.select(sql`true`.as('isDefault'))
						.select(sql`'Default Watchlist'`.as('name'))
						.whereNotExists((iqb) => iqb.selectFrom('s').select(sql`1`.as('one')))
				)
				.returning('id')
		)
		.selectFrom((qb) =>
			qb.selectFrom('s').select('s.id').unionAll(qb.selectFrom('i').select('i.id')).as('id')
		)
		.selectAll()
		.executeTakeFirstOrThrow();

	let watchlistId: string;
	try {
		const row = await promise;
		watchlistId = row.id;
	} catch (err) {
		const { message } = err as Error;
		console.log(message);
		if (
			message.includes('invalid input syntax for type uuid') ||
			message.includes('watchlist_user_id_fkey')
		) {
			throw new NotFoundError('User not found');
		}

		throw err;
	}

	const newItems: { imdbItemId: string; watchlistId: string }[] = addedItemIds.map((itemId) => ({
		imdbItemId: itemId,
		watchlistId
	}));

	if (newItems.length > 0) {
		await db.insertInto('watchlistItem').values(newItems).execute();
	}

	const result = await getDefaultWatchlistItemsByUserId(userId, userId, {
		imdbItemIds: addedItemIds
	});
	return result;
};

export const deleteItemsFromDefaultWatchlist = async (itemIds: string[]): Promise<string[]> => {
	const deletedItemIds = await db
		.deleteFrom('watchlistItem')
		.where('id', 'in', itemIds)
		.returning('id')
		.execute();

	return deletedItemIds.map((row) => row.id);
};

export const searchIMDB = async (query: string): Promise<SearchResultEntry[]> => {
	const result = await search(query);
	return result;
};

// LEGACY CODE
// const statement = sql<QueryResult>`
//   WITH s AS (
//     SELECT COALESCE(json_agg(res) FILTER (WHERE res.id IS NOT NULL)) AS items
//     FROM (
//       SELECT watchlist_item.*, (
//         SELECT item FROM (
//           SELECT imdb_item.*, item_elo.elo_rating, requesters_elo.elo_rating AS requesters_elo_rating,
//           (
//             SELECT
//             COALESCE(json_agg(imdb_creator) FILTER (WHERE imdb_creator.id IS NOT NULL), '[]')
//             FROM imdb_creator_filmography
//             LEFT JOIN imdb_creator ON imdb_creator_filmography.creator_id = imdb_creator.id
//             WHERE imdb_creator_filmography.item_id = imdb_item.id
//           ) AS creators,
//           (
//             SELECT
//             COALESCE(json_agg(imdb_star) FILTER (WHERE imdb_star.id IS NOT NULL), '[]')
//             FROM imdb_star_filmography
//             LEFT JOIN imdb_star ON imdb_star_filmography.star_id = imdb_star.id
//             WHERE imdb_star_filmography.item_id = imdb_item.id
//           ) AS stars,
//           (
//             SELECT
//             COALESCE(json_agg(imdb_genre) FILTER (WHERE imdb_genre.name IS NOT NULL), '[]')
//             FROM imdb_item_genre
//             LEFT JOIN imdb_genre ON imdb_item_genre.genre_name = imdb_genre.name
//             WHERE imdb_item_genre.item_id = imdb_item.id
//           ) AS genres
//         ) AS item
//       )
//       FROM watchlist
//       LEFT JOIN watchlist_item ON watchlist.id = watchlist_item.watchlist_id
//       LEFT JOIN imdb_item ON watchlist_item.imdb_item_id = imdb_item.id
//       LEFT JOIN item_elo ON (imdb_item.id = item_elo.imdb_item_id AND item_elo.user_id = ${userId})
//       LEFT JOIN item_elo AS requesters_elo ON (imdb_item.id = requesters_elo.imdb_item_id AND requesters_elo.user_id = ${requesterUserId ?? '123'})
//       WHERE watchlist.user_id = ${userId} AND watchlist.is_default = true ${toCheck}
//       GROUP BY watchlist_item.id, imdb_item.id, item_elo.elo_rating, requesters_elo.elo_rating
//       ORDER BY ${sql.ref(orderBy)} ${sql.raw(orderDirection)} NULLS LAST
//     ) AS res
//   ), i AS (
//     INSERT INTO watchlist (user_id, is_default, name)
//     SELECT ${userId}, true, 'Default Watchlist'
//     WHERE NOT EXISTS (SELECT 1 FROM s)
//     RETURNING '[]'::JSON AS items
//   )
//   SELECT items FROM s
//   UNION ALL
//   SELECT items FROM i`;

// const statement = sql<{ id: string }>`
//   WITH s AS (
//     SELECT id FROM watchlist
//     WHERE user_id = ${userId} AND is_default = true
//   ), i AS (
//     INSERT INTO watchlist (user_id, is_default, name)
//     SELECT ${userId}, true, ${name}
//     WHERE NOT EXISTS (SELECT 1 FROM s)
//     RETURNING id
//   )
//   SELECT id FROM s
//   UNION ALL
//   SELECT id FROM i`;

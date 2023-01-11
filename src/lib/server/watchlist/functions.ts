import { getItemsByIds, search, type LookupResult, type SearchResultEntry } from '@goatpit/imdb';
import { sql } from 'kysely';
import { db } from '../database';
import type { IMDBCreator, IMDBGenre, IMDBItem, IMDBStar } from '../database/types/imdb';
import type { WatchlistItem, Watchlist as DBWatchlist } from '../database/types/watchlist';
import type { ExtendedIMDBItem, ExtendedWatchlist, ExtendedWatchlistItem, GetItemsOptions, ReadableDBWatchlist, WatchlistUser } from './types';

// Custom exception
export class UserNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UserNotFoundError';
	}
}

export class WatchlistNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'WatchlistNotFoundError';
	}
}

export const getWatchlistByUserId = async (
	userId: string,
	requesterUserId: string,
	watchlistId: string,
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

	let defaultWatchlistType: 'isDefaultTowatchlist' | 'isDefaultWatchlist' | undefined;
	switch (watchlistId) {
		case 'towatchlist':
			defaultWatchlistType = 'isDefaultTowatchlist';
			break;
		case 'watchlist':
			defaultWatchlistType = 'isDefaultWatchlist';
			break;
		default:
			defaultWatchlistType = undefined;  // Just for readability
	}

	const insertColumns: ('userId' | 'name' | 'isDefaultTowatchlist' | 'isDefaultWatchlist')[] = ['userId', 'name'];
	if (defaultWatchlistType !== undefined)
		insertColumns.push(defaultWatchlistType);

	const promise = db
		.with('swatchlist', (sw) =>
			sw
				.selectFrom('watchlist')
				.innerJoin('user', 'watchlist.userId', 'user.id')
				.selectAll('watchlist')
				.select(
					sql<WatchlistUser>`json_build_object('email', "user"."email", 'id', "user"."id")`.as(
						'user'
					)
				)
				.where('userId', '=', userId)
				.if(defaultWatchlistType !== undefined, (s) => s.where(sql.ref(defaultWatchlistType ?? 'isDefaultWatchlist'), '=', true))
				.if(defaultWatchlistType === undefined, (s) => s.where('watchlist.id', '=', watchlistId))
				.assertType<ReadableDBWatchlist & { user: WatchlistUser }>()
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
										// .select(sql<number>`((item_elo.elo_rating - (SELECT min_elo_rating FROM rl)) * 100) / ((SELECT max_elo_rating FROM rl) - (SELECT min_elo_rating FROM rl))`.as('eloPercentage'))
										// .select(sql<number>`((requesters_elo.elo_rating - (SELECT min_requesters_elo_rating FROM rl)) * 100) / ((SELECT max_requesters_elo_rating FROM rl) - (SELECT min_requesters_elo_rating FROM rl))`.as('requestersEloPercentage'))
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
				.assertType<{ items: ExtendedWatchlistItem[] }>()
		)
		.with('i', (i) =>
			i
				.insertInto('watchlist')
				.columns(insertColumns)
				.expression((qb) =>
					qb
						.selectFrom(sql`(values (1))`.as('t'))
						.select(sql`${userId}`.as('userId'))
						.select(sql`'Default Watchlist'`.as('name'))
						.if(defaultWatchlistType !== undefined, (s) => s.select(sql`true`.as(defaultWatchlistType ?? 'isDefaultWatchlist')))
						.whereNotExists((iqb) => iqb
							.selectFrom('swatchlist')
							.select('id')
							
						)
						.if(defaultWatchlistType === undefined, (s) => s.where(sql`false`))  // Always fail to automatically create non default watchlist
				)
				.returningAll()
				// .returning((qb) => )
				.returning(sql<WatchlistUser>`(
					SELECT json_build_object('email', "user"."email", 'id', "user"."id")
					FROM "user" WHERE "user"."id" = ${userId}
				)`.as('user'))
				.returning(sql<ExtendedWatchlistItem[]>`'[]'::JSON`.as('items'))
				.assertType<ExtendedWatchlist>()
		)
		.selectFrom([
			// 'swatchlist',
			(qb) =>
				qb
					.selectFrom('swatchlist as sw')
					// .selectAll('swatchlist')
					.select(['sw.id', 'sw.name', 'sw.description', 'sw.isPublic', 'sw.isDefaultWatchlist', 'sw.isDefaultTowatchlist', 'sw.userId', 'sw.createdAt', 'sw.updatedAt', 'sw.user'])
					.unionAll(qb.selectFrom('i').select(['i.id', 'i.name', 'i.description', 'i.isPublic', 'i.isDefaultWatchlist', 'i.isDefaultTowatchlist', 'i.userId', 'i.createdAt', 'i.updatedAt', 'i.user']))
					.as('ww'),
			(qb) =>
				qb
					.selectFrom('s')
					.select('s.items')
					.unionAll(qb.selectFrom('i').select('i.items'))
					.as('items')
		])
		.selectAll('ww')
		.select(sql<ExtendedWatchlistItem[]>`COALESCE(items.items, '[]')`.as('items'))
		.executeTakeFirstOrThrow();

	try {
		// time promise
		const start = Date.now();
		const row = await promise;
		const end = Date.now();
		console.log(`Query took ${end - start}ms`);
		// console.log(JSON.stringify(row, null, 2))
		return row;
	} catch (err) {
		const { message } = err as Error;
		console.log(message);
		if (
			message.includes('invalid input syntax for type uuid') ||
			message.includes('watchlist_user_id_fkey')
		) {
			throw new UserNotFoundError('User not found');
		}
		else if (message === 'no result') {
			throw new WatchlistNotFoundError('Watchlist not found');
		}

		throw err;
	}
};

export const getWatchlistItemsByUserId = async (
	userId: string,
	requesterUserId: string,
	watchlistId: string,
	options: GetItemsOptions = {},
): Promise<ExtendedWatchlistItem[]> => {
	const watchlist = await getWatchlistByUserId(userId, requesterUserId, watchlistId, options);

	return watchlist?.items || [];
};

export const addIMDBItemsIfNotExists = async (itemIds: string[]): Promise<string[]> => {
	if (itemIds.length <= 0) return [];

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

export const addItemsToWatchlistIfNotExists = async (
	userId: string,
	watchlistId: string,
	itemIds: string[],
): Promise<ExtendedWatchlistItem[]> => {
	// Make sure all the items exist in the database
	const addedItemIds = await addIMDBItemsIfNotExists(itemIds);

	let defaultWatchlistType: 'isDefaultWatchlist' | 'isDefaultTowatchlist' | undefined;
	switch (watchlistId) {
		case 'towatchlist':
			defaultWatchlistType = 'isDefaultTowatchlist';
			break;
		case 'watchlist':
			defaultWatchlistType = 'isDefaultWatchlist';
			break;
		default:
			defaultWatchlistType = undefined;  // Just for readability
	}

	const insertColumns: ('userId' | 'name' | 'isDefaultWatchlist' | 'isDefaultTowatchlist')[] = ['userId', 'name'];
	if (defaultWatchlistType !== undefined) {
		insertColumns.push(defaultWatchlistType ?? 'isDefaultWatchlist');
	}

	const promise = db
		.with('s', (s) =>
			s
				.selectFrom('watchlist')
				.select('id')
				.where('userId', '=', userId)
				.if(defaultWatchlistType !== undefined, (s) => s.where(sql.ref(defaultWatchlistType ?? 'isDefaultWatchlist'), '=', true))
				.if(defaultWatchlistType === undefined, (s) => s.where('id', '=', watchlistId))
		)
		.with('i', (i) =>
			i
				.insertInto('watchlist')
				.columns(insertColumns)
				.expression((qb) =>
					qb
						.selectFrom(sql`(values (1))`.as('t'))
						.select(sql`${userId}`.as('userId'))
						.select(sql`'Default Watchlist'`.as('name'))
						.if(defaultWatchlistType !== undefined, (q) => q.select(sql`true`.as(defaultWatchlistType ?? 'isDefaultWatchlist')))
						.whereNotExists((iqb) => iqb.selectFrom('s').select(sql`1`.as('one')))
						.if(defaultWatchlistType === undefined, (s) => s.where(sql`false`))  // Always fail to automatically create non default watchlist
				)
				.returning('id')
		)
		.selectFrom((qb) =>
			qb.selectFrom('s').select('s.id').unionAll(qb.selectFrom('i').select('i.id')).as('id')
		)
		.selectAll()
		.executeTakeFirstOrThrow();

	let actualWatchlistId: string;
	try {
		const row = await promise;
		actualWatchlistId = row.id;
	} catch (err) {
		const { message } = err as Error;
		console.log(message);
		if (
			message.includes('invalid input syntax for type uuid') ||
			message.includes('watchlist_user_id_fkey')
		) {
			throw new UserNotFoundError('User not found');
		}
		else if (message === 'no result') {
			throw new WatchlistNotFoundError('Watchlist not found');
		}

		throw err;
	}

	const newItems: { imdbItemId: string; watchlistId: string }[] = addedItemIds.map((itemId) => ({
		imdbItemId: itemId,
		watchlistId: actualWatchlistId,
	}));

	const formatted = newItems.map(
		(item) => sql`(${item.imdbItemId}::text, ${item.watchlistId}::uuid)`
	);
	const statement = sql<{imdbItemId: string}>`with data(imdb_item_id, watchlist_id) as (
			values ${sql.join(formatted)}
		)
		insert into watchlist_item (imdb_item_id, watchlist_id)
		select d.imdb_item_id, d.watchlist_id
		from data as d
		where not exists (
			select imdb_item_id, watchlist_id from watchlist_item as i
			where i.imdb_item_id = d.imdb_item_id and i.watchlist_id = d.watchlist_id
		)
		returning imdb_item_id`;

	const ret = await statement.execute(db);
	const newIds = ret.rows.map((row) => row.imdbItemId);

	if (newIds.length > 0) {
		const result = await getWatchlistItemsByUserId(userId, userId, watchlistId, {
			imdbItemIds: newIds
		});
		return result;
	}
	return [];
};

export const deleteItemsFromWatchlist = async (itemIds: string[]): Promise<string[]> => {
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

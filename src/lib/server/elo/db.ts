import { sql } from 'kysely';
import { db } from '../database/index';
import type { RandomMatchup, RandomMatchupPayload } from './types';
import type { ReadableImdbItem, ReadableItemElo } from '$lib/types';
import type { ItemElo } from '../database/types/eloranking';

export const getEloRatingForItem = async (
	userId: string,
	imdbItemId: string
): Promise<number | null> => {
	const row = await db
		.selectFrom('itemElo')
		.select('eloRating')
		.where('userId', '=', userId)
		.where('imdbItemId', '=', imdbItemId)
		.executeTakeFirst();

	return row ? row.eloRating : null;
};

export const insertEloItem = async (userId: string, imdbItemId: string): Promise<number> => {
	const row = await db
		.insertInto('itemElo')
		.values({ userId, imdbItemId })
		.returning('eloRating')
		.executeTakeFirstOrThrow();

	return row.eloRating;
};

export const updateEloItem = async (
	userId: string,
	imdbItemId: string,
	newEloRating: number
): Promise<number> => {
	const row = await db
		.updateTable('itemElo')
		.set({ eloRating: newEloRating, updatedAt: new Date() })
		.where('imdbItemId', '=', imdbItemId)
		.where('userId', '=', userId)
		.returning('eloRating')
		.executeTakeFirstOrThrow();

	return row.eloRating;
};

export const insertEloMatchup = async (
	userId: string,
	imdbItemId1: string,
	imdbItemId2: string,
	winner: string,
	genre: string | null,
	startedAt: Date,
): Promise<void> => {
	await db
		.insertInto('itemEloMatchup')
		.values({
			userId,
			imdbItemId1,
			imdbItemId2,
			winnerImdbItemId: winner,
			imdbGenreName: genre,
			startedAt,
		})
		.execute();
};

// Gets two random IMDb items that have the same random genre.
export const getTwoRandomImdbItemsMatchingRandomGenre = async (
	userId: string,
	watchlistIds: string[],
	genreNames: string[],
): Promise<RandomMatchup | null> => {
	const rows = await db
		.selectFrom((eb) =>
			eb
				.selectFrom('imdbItemGenre')
				.innerJoin('imdbItem', 'imdbItem.id', 'imdbItemGenre.itemId')
				.innerJoin('watchlistItem', 'watchlistItem.imdbItemId', 'imdbItem.id')
				.innerJoin('watchlist', 'watchlist.id', 'watchlistItem.watchlistId')
				.select('imdbItemGenre.genreName')
				.where('watchlist.userId', '=', userId)
				.if(watchlistIds.length > 0, (qb) => qb.where('watchlist.id', 'in', watchlistIds))
				.if(genreNames.length > 0, (qb) => qb.where('imdbItemGenre.genreName', 'in', genreNames))
				.groupBy('imdbItemGenre.genreName')
				.having(sql`count(*) >= 2`)
				.orderBy(sql`random()`)
				.limit(1)
				.as('nested')
		)
		.innerJoin('imdbItemGenre', 'imdbItemGenre.genreName', 'nested.genreName')
		.innerJoin('imdbItem', 'imdbItem.id', 'imdbItemGenre.itemId')
		.innerJoin('watchlistItem', 'watchlistItem.imdbItemId', 'imdbItem.id')
		.innerJoin('watchlist', 'watchlist.id', 'watchlistItem.watchlistId')
		.leftJoin('itemElo', (join) => join
			.onRef('itemElo.imdbItemId', '=', 'imdbItem.id')
			.on('itemElo.userId', '=', userId)
		)
		// .innerJoin('itemElo', 'itemElo.imdbItemId', 'imdbItem.id')
		.select(['imdbItemGenre.genreName', 'itemElo.eloRating'])
		.select(sql<ReadableImdbItem>`row_to_json(imdb_item)`.as('imdbItem'))
		.where('watchlist.userId', '=', userId)
		.if(watchlistIds.length > 0, (qb) => qb.where('watchlist.id', 'in', watchlistIds))
		.if(genreNames.length > 0, (qb) => qb.where('imdbItemGenre.genreName', 'in', genreNames))
		.orderBy(sql`random()`)
		.limit(2)
		.execute();

	// return rows;

	if (rows.length !== 2) {
		return null;
	}

	// return rows;
	if (rows[0].eloRating === null) {
		const eloRating = await insertEloItem(userId, rows[0].imdbItem.id);
		rows[0].eloRating = eloRating;
	}

	if (rows[1].eloRating === null) {
		const eloRating = await insertEloItem(userId, rows[1].imdbItem.id);
		rows[1].eloRating = eloRating;
	}

	return {
		compareFactor: null,
		compareFactorType: null,
		imdbItem1: rows[0].imdbItem as ReadableImdbItem,
		imdbItem2: rows[1].imdbItem as ReadableImdbItem,
		itemElo1: rows[0].eloRating,
		itemElo2: rows[1].eloRating,
	};
};

// Gets two random IMDb items that doesn't necessarily have the same genre.
export const getTwoRandomImdbItemsIgnoreMatchingGenre = async (
	userId: string,
	watchlistIds: string[],
	genreNames: string[],
): Promise<RandomMatchup | null> => {
	const rows = await db
		.selectFrom('watchlistItem')
		.innerJoin('watchlist', 'watchlist.id', 'watchlistItem.watchlistId')
		.innerJoin('imdbItem', 'imdbItem.id', 'watchlistItem.imdbItemId')
		.innerJoin('imdbItemGenre', 'imdbItemGenre.itemId', 'imdbItem.id')
		.leftJoin('itemElo', (join) => join
			.onRef('itemElo.imdbItemId', '=', 'imdbItem.id')
			.on('itemElo.userId', '=', userId)
		)
		// .leftJoin('itemElo', 'itemElo.imdbItemId', 'imdbItem.id')
		.select('itemElo.eloRating')
		// .select('itemElo.eloRating')
		// .select(sql``.as('itemElo'))
		// .select(sql<ReadableItemElo[]>`json_agg(item_elo)`.as('itemElo'))
		// .selectAll('imdbItem')
		.select(sql<ReadableImdbItem>`row_to_json(imdb_item)`.as('imdbItem'))
		.where('watchlist.userId', '=', userId)
		// .where('itemElo.userId', '=', userId)
		// .where('itemElo.userId', '=', userId)
		.if(watchlistIds.length > 0, (qb) => qb.where('watchlist.id', 'in', watchlistIds))
		.if(genreNames.length > 0, (qb) => qb.where('imdbItemGenre.genreName', 'in', genreNames))
		.groupBy(['imdbItem.id', 'itemElo.imdbItemId', 'itemElo.eloRating'])
		.orderBy(sql`random()`)
		.limit(2)
		.execute();

	// return rows;

	if (rows.length !== 2) {
		return null;
	}

	console.log(JSON.stringify(rows, null, 2))

	if (rows[0].eloRating === null) {
		const eloRating = await insertEloItem(userId, rows[0].imdbItem.id);
		rows[0].eloRating = eloRating;
	}

	if (rows[1].eloRating === null) {
		const eloRating = await insertEloItem(userId, rows[1].imdbItem.id);
		rows[1].eloRating = eloRating;
	}

	return {
		compareFactor: null,
		compareFactorType: null,
		imdbItem1: rows[0].imdbItem as ReadableImdbItem,
		imdbItem2: rows[1].imdbItem as ReadableImdbItem,
		itemElo1: rows[0].eloRating,
		itemElo2: rows[1].eloRating,
	};
};


// Gets two random IMDb items that have the same random genre.
export const getTwoSimilarImdbItemsMatchingRandomGenre = async (
	userId: string,
	watchlistIds: string[],
	genreNames: string[],
): Promise<RandomMatchup | null> => {
	// valid uuid
	// userId = '00000000-0000-0000-0000-000000000000';

	const rows = await db
		.with('chosenGenre', (qb) => qb
			.selectFrom('watchlistItem')
			.innerJoin('watchlist', 'watchlist.id', 'watchlistItem.watchlistId')
			.innerJoin('imdbItem', 'imdbItem.id', 'watchlistItem.imdbItemId')
			.innerJoin('imdbItemGenre', 'imdbItemGenre.itemId', 'imdbItem.id')
			.select('imdbItemGenre.genreName')
			.where('watchlist.userId', '=', userId)
			.if(watchlistIds.length > 0, (qb) => qb.where('watchlist.id', 'in', watchlistIds))
			.if(genreNames.length > 0, (qb) => qb.where('imdbItemGenre.genreName', 'in', genreNames))
			.groupBy('imdbItemGenre.genreName')
			.having(sql`count(*) >= 2`)
			.orderBy(sql`random()`)
			.limit(1)
			.assertType<{ genreName: string }>()
		)
		.with('sortedInner', (qb) => qb
			.selectFrom("watchlistItem")
			.innerJoin("watchlist", "watchlist.id", "watchlistItem.watchlistId")
			.innerJoin("imdbItem", "imdbItem.id", "watchlistItem.imdbItemId")
			.innerJoin("imdbItemGenre", "imdbItemGenre.itemId", "imdbItem.id")
			.leftJoin('itemElo', (join) => join
				.onRef('itemElo.imdbItemId', '=', 'imdbItem.id')
				.on('itemElo.userId', '=', userId)
			)
			.select('itemElo.eloRating')
			.select(sql<ReadableImdbItem>`row_to_json(imdb_item)`.as('imdbItem'))
			.where('watchlist.userId', '=', userId)
			.where('imdbItemGenre.genreName', '=', sql`(SELECT genre_name FROM chosen_genre)`)
			.if(watchlistIds.length > 0, (qb) => qb.where('watchlist.id', 'in', watchlistIds))
			.if(genreNames.length > 0, (qb) => qb.where('imdbItemGenre.genreName', 'in', genreNames))
			.groupBy(['itemElo.eloRating', 'imdbItem.id'])
			.orderBy('itemElo.eloRating')
		)
		.selectFrom([
			(qe) => qe
				.selectFrom("sortedInner")
				.selectAll()
				.limit(10)
				.modifyEnd(sql`OFFSET (SELECT random() * GREATEST(count(*) - 10, 0) FROM sorted_inner)`)
				.as("innerNested"),
			'chosenGenre'
		])
		.orderBy(sql`random()`)
		.selectAll()
		.select("chosenGenre.genreName")
		.limit(2)
		.execute();

	// return rows;

	if (rows.length !== 2) {
		return null;
	}

	if (rows[0].eloRating === null) {
		const eloRating = await insertEloItem(userId, rows[0].imdbItem.id);
		rows[0].eloRating = eloRating;
	}

	if (rows[1].eloRating === null) {
		const eloRating = await insertEloItem(userId, rows[1].imdbItem.id);
		rows[1].eloRating = eloRating;
	}

	return {
		compareFactor: rows[0].genreName,
		compareFactorType: "genre",
		imdbItem1: rows[0].imdbItem as ReadableImdbItem,
		imdbItem2: rows[1].imdbItem as ReadableImdbItem,
		itemElo1: rows[0].eloRating,
		itemElo2: rows[1].eloRating,
	};
};


// Gets two random IMDb items that doesn't necessarily have the same genre.
export const getTwoSimilarImdbItemsIgnoreMatchingGenre = async (
	userId: string,
	watchlistIds: string[],
	genreNames: string[],
): Promise<RandomMatchup | null> => {
	// valid uuid
	// userId = '00000000-0000-0000-0000-000000000000';

	const rows = await db
	  .with('sortedInner', (qb) => qb
			.selectFrom("watchlistItem")
			.innerJoin("watchlist", "watchlist.id", "watchlistItem.watchlistId")
			.innerJoin("imdbItem", "imdbItem.id", "watchlistItem.imdbItemId")
			.innerJoin("imdbItemGenre", "imdbItemGenre.itemId", "imdbItem.id")  // CUT??
			.leftJoin('itemElo', (join) => join
				.onRef('itemElo.imdbItemId', '=', 'imdbItem.id')
				.on('itemElo.userId', '=', userId)
			)
			.select('itemElo.eloRating')
			.select(sql<ReadableImdbItem>`row_to_json(imdb_item)`.as('imdbItem'))
			.groupBy(["imdbItem.id", "itemElo.eloRating"])
			.where("watchlist.userId", "=", userId)
			.if(watchlistIds.length > 0, (qb) => qb.where('watchlist.id', 'in', watchlistIds))
			.if(genreNames.length > 0, (qb) => qb.where('imdbItemGenre.genreName', 'in', genreNames))
			.orderBy('itemElo.eloRating')
		)
		.selectFrom((qe) => qe
			.selectFrom("sortedInner")
			.selectAll()
			.limit(10)
			.modifyEnd(sql`OFFSET (SELECT random() * GREATEST(count(*) - 10, 0) FROM sorted_inner)`)
			.as("innerNested")
		)
		.orderBy(sql`random()`)
		.selectAll()
		.limit(2)
		.execute();

	// return rows;

	if (rows.length !== 2) {
		return null;
	}

	// console.log(JSON.stringify(rows, null, 2))

	if (rows[0].eloRating === null) {
		const eloRating = await insertEloItem(userId, rows[0].imdbItem.id);
		rows[0].eloRating = eloRating;
	}

	if (rows[1].eloRating === null) {
		const eloRating = await insertEloItem(userId, rows[1].imdbItem.id);
		rows[1].eloRating = eloRating;
	}

	return {
		compareFactor: null,
		compareFactorType: null,
		imdbItem1: rows[0].imdbItem as ReadableImdbItem,
		imdbItem2: rows[1].imdbItem as ReadableImdbItem,
		itemElo1: rows[0].eloRating,
		itemElo2: rows[1].eloRating,
	};
};
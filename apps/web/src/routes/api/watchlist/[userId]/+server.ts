import { db } from '$lib/server/database';
import type { WatchlistItem } from '$lib/server/database/types/watchlist';
import { error, json } from '@sveltejs/kit';
import { sql } from 'kysely';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = async ({ params }) => {
  const userId = params.userId;
  console.log("before")
  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('id', '=' , userId)
    .executeTakeFirst();
  console.log("after")
  if (!user) throw error(404, 'User not found');

  const watchlist = await db
    .selectFrom("watchlist")
    .where("userId", "=", userId)
    .leftJoin("watchlistItem", "watchlist.id", "watchlistItem.watchlistId")
    .selectAll("watchlist")
    .select(
      sql<WatchlistItem[]>`COALESCE(json_agg(watchlist_item) FILTER (WHERE watchlist_item.id IS NOT NULL), '[]')`.as(
        "items"
      )
    )
    .groupBy("watchlist.id")
    .executeTakeFirst();

  if (!watchlist) {
    const newWatchlist = await db
      .insertInto("watchlist")
      .values({ userId })
      .returningAll()
      .executeTakeFirstOrThrow();

    return json({
      ...newWatchlist,
      items: [],
    });
  }

  return json(watchlist);
};


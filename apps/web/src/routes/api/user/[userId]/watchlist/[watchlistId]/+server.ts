import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getWatchlistByUserId } from "$lib/server/watchlist/functions";


export const GET: RequestHandler = async ({ params, url, locals }) => {
  const session = await locals.validate();
  const watchlistId = params.watchlistId;
  const userId = params.userId;

  const orderBy = url.searchParams.get("orderBy") || "eloRating" || "addedAt";
  const orderDirection = url.searchParams.get("orderDirection") || "DESC";

  try {
    const items = await getWatchlistByUserId(userId, session?.userId ?? '', watchlistId, {
      orderBy,
      orderDirection,
    });
    return json(items);
  } catch (e) {
    const err = e as Error;
    if (["UserNotFoundError", "WatchlistNotFoundError"].includes(err.name)) {
      throw error(404, err.message);
    }

    throw e;
  }
}
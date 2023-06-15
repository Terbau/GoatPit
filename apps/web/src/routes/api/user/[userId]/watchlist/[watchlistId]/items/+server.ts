import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { addItemsToWatchlistIfNotExists, deleteItemsFromWatchlist, getWatchlistItemsByUserId } from "$lib/server/watchlist/functions";


export const GET: RequestHandler = async ({ params, url, locals }) => {
  const session = await locals.validate();
  const userId = params.userId;
  const watchlistId = params.watchlistId;

  const orderBy = url.searchParams.get("orderBy") || "eloRating" || "addedAt";
  const orderDirection = url.searchParams.get("orderDirection") || "DESC";

  try {
    const items = await getWatchlistItemsByUserId(userId, session?.userId ?? '', watchlistId, {
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


export const POST: RequestHandler = async ({ params, request, locals }) => {
  const userId = params.userId;
  const watchlistId = params.watchlistId; 
  const session = await locals.validate();

  if (!session) {
    throw error(401, "Unauthorized");
  }

  if (userId !== session.userId) {
    throw error(403, "Forbidden");
  }

  const body: string[] = await request.json();

  if (!Array.isArray(body)) {
    throw error(400, "Invalid request body");
  }

  if (body.length === 0 || body.length > 100) { 
    throw error(400, "Invalid few or too many items (max 100)");
  }

  const result = await addItemsToWatchlistIfNotExists(userId, watchlistId, body);

  return json({
    result: "success",
    newItems: result,
  })
}

// Doesn't really need params.watchlistId, but no reason to change anything
export const DELETE: RequestHandler = async ({ params, request, locals }) => {
  const userId = params.userId;
  const session = await locals.validate();

  if (!session) {
    throw error(401, "Unauthorized");
  }

  if (userId !== session.userId) {
    throw error(403, "Forbidden");
  }

  const itemIds: string[] = await request.json();

  if (!Array.isArray(itemIds)) {
    throw error(400, "Invalid request body");
  }

  // if (itemIds.length === 0 || itemIds.length > 100) { 
  //   throw error(400, "Invalid few or too many items (max 100)");
  // }

  const result = await deleteItemsFromWatchlist(itemIds);

  return json({
    result: "success",
    deletedItemIds: result,
  })
}
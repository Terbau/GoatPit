import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { addItemsToDefaultWatchlistIfNotExists, deleteItemsFromDefaultWatchlist, getDefaultWatchlistItemsByUserId } from "$lib/server/functions";


export const GET: RequestHandler = async ({ params, url }) => {
  const userId = params.userId;

  const orderBy = url.searchParams.get("orderBy") || "eloRating" || "addedAt";
  const orderDirection = url.searchParams.get("orderDirection") || "DESC";

  try {
    const items = await getDefaultWatchlistItemsByUserId(userId, {
      orderBy,
      orderDirection,
    });
    return json(items);
  } catch (e) {
    const err = e as Error;
    if (err.name === "NotFoundError") {
      throw error(404, "User not found");
    }

    throw e;
  }
}


export const POST: RequestHandler = async ({ params, request, locals }) => {
  const userId = params.userId;
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

  const result = await addItemsToDefaultWatchlistIfNotExists(userId, body);

  return json({
    result: "success",
    newItems: result,
  })
}

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

  if (itemIds.length === 0 || itemIds.length > 100) { 
    throw error(400, "Invalid few or too many items (max 100)");
  }

  const result = await deleteItemsFromDefaultWatchlist(itemIds);

  return json({
    result: "success",
    deletedItemIds: result,
  })
}
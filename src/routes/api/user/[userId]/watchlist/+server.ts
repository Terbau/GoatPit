import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDefaultWatchlistByUserId } from "$lib/server/functions";


export const GET: RequestHandler = async ({ params, url, locals }) => {
  const session = await locals.validate();
  const userId = params.userId;

  const orderBy = url.searchParams.get("orderBy") || "eloRating" || "addedAt";
  const orderDirection = url.searchParams.get("orderDirection") || "DESC";

  try {
    const items = await getDefaultWatchlistByUserId(userId, session?.userId ?? '', {
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
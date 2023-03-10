import { addItemsToWatchlistIfNotExists } from '$lib/server/watchlist/functions';
import { getRawWatchlistByUserId, getWatchlistByUserId } from '@goatpit/imdb';
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals, params }) => {
  const userId = params.userId;
  const watchlistId = params.watchlistId ?? 'watchlist';
  const session = await locals.validate();

  if (!session) {
    throw error(401, "Unauthorized");
  }

  if (userId !== session.userId) {
    throw error(403, "Forbidden");
  }

  const { imdbUserId }: { imdbUserId: string } = await request.json();

  if (!imdbUserId) {
    throw error(400, "Invalid request body");
  }

  const items = await getRawWatchlistByUserId(imdbUserId);
  const itemIds = items.map((item) => item.imdbItemId);

  const result = await addItemsToWatchlistIfNotExists(userId, watchlistId, itemIds);

  return json({
    result: "success",
    newItems: result,
  });
};
import { getTwoRandomImdbItemsMatchingRandomGenre } from '$lib/server/elo/db';
import { getTwoRandomImdbItemsIgnoreMatchingGenre } from '$lib/server/elo/db';
import { json, type RequestHandler } from "@sveltejs/kit";

interface RequestBody {
  watchlistIds: string[];
  genreNames: string[];
}

export const GET: RequestHandler = async ({ request, params }) => {
  const userId = params.userId ?? "";

  // const body: RequestBody = await request.json();
  const body: any = {};
  const watchlistIds = body.watchlistIds || [];
  const genreNames = body.genreNames || [];

  // TODO:
  // Test watchlistIds and genreNames
  // What happens if there arent enough matches?

  const items = await getTwoRandomImdbItemsIgnoreMatchingGenre(
    userId,
    watchlistIds,
    genreNames,
  );

  // const items = await getTwoRandomImdbItemsIgnoreMatchingGenre(
  //   userId,
  //   watchlistIds,
  //   genreNames,
  // )
  return json(items);
}
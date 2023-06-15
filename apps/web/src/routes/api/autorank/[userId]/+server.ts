import type { InitialCreateMatchupPayload, RandomMatchupFinishedResponse, RandomMatchupPayload } from '$lib/server/elo/types';
import { handleMatchupCreate, handleMatchupResponse } from '$lib/server/elo/functions';
import { error, json, type RequestHandler } from "@sveltejs/kit";


export const GET: RequestHandler = async ({ request, params, url, locals }) => {
  const userId = params.userId ?? "";
  const session = await locals.validate();

  console.log(userId, session?.userId)

  if (!session || session.userId !== userId) {
    throw error(401, "Unauthorized");
  }

  const watchlistIds: string[] = (url.searchParams.get("watchlistIds") || "").split(",").filter((x) => x !== "");
  const genreNames: string[] = (url.searchParams.get("genreNames") || "").split(",").filter((x) => x !== "");
  const compareFactorTypes: string[] = (url.searchParams.get("compareFactorTypes") || "").split(",").filter((x) => x !== "");

  console.log(watchlistIds, genreNames, compareFactorTypes)

  // const body: InitialCreateMatchupPayload = await request.json();
  // const body: any = {};
  // const watchlistIds = body.watchlistIds || [];
  // const genreNames = body.genreNames || [];
  // const compareFactorTypes = body.compareFactorTypes || [];

  let payload: RandomMatchupPayload;
  try {
    payload = await handleMatchupCreate(
      userId,
      watchlistIds,
      genreNames,
      compareFactorTypes,
    );
  } catch (e) {
    console.log(e)
    throw error(404, "Not enough items found");
  }

  return json(payload);
}


export const POST: RequestHandler = async ({ request, params }) => {
  const userId = params.userId ?? "";

  const body: RandomMatchupFinishedResponse = await request.json();

  let payload: RandomMatchupPayload;
  try {
    payload = await handleMatchupResponse(
      userId,
      body,
    );
  } catch (e) {
    console.log(e)
    throw error(404, "Not enough items found");
  }

  return json(payload);
}


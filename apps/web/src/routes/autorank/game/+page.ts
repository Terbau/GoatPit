import { browser } from "$app/environment";
import type { RandomMatchupPayload } from "$lib/server/elo/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  const gameData: RandomMatchupPayload = browser ? JSON.parse(localStorage.getItem("currentGame") || 'null') : null;

  return {
    gameData,
    isLoaded: browser,
  }
};
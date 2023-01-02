import { browser } from "$app/environment";
import type { RandomMatchupPayload } from "$lib/server/elo/types";
import { writable } from "svelte/store";

const stored = browser ? JSON.parse(localStorage.getItem("currentGame") || 'null') : null;
export const currentGame = writable<RandomMatchupPayload | null>(stored);

currentGame.subscribe((value) => {
  if (browser) {
    localStorage.setItem("currentGame", JSON.stringify(value));
  }
})
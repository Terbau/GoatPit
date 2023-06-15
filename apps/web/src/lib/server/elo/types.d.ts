import { ReadableImdbItem } from './../../types.d';
import type { ReadableImdbItem } from '$lib/types';
import { IMDBItem } from './../database/types/imdb';

export interface ItemEloMatchup {
  userId: string;
  imdbItemId1: string;
  imdbItemId2: string;
  itemElo1: number;
  itemElo2: number;
  compareFactor: string | null;
  compareFactorType: string | null;
  compareFactorTypes: string[];
  startedAt: Date;
}

export interface GenerateMatchupOptions {
  genreNames?: string[];
  watchlistIds?: string[];
  compareFactorTypes?: string[];
}

export interface RandomMatchup {
  compareFactor: string | null;
  compareFactorType: string | null;
  imdbItem1: ReadableImdbItem;
  imdbItem2: ReadableImdbItem;
  itemElo1: number;
  itemElo2: number;
}

export interface RandomMatchupPayload {
  token: string;
  items: ReadableImdbItem[];
  compareFactor: string | null;
  compareFactorType: string | null;
  compareFactorTypes: string[];
  genreNames: string[];
  watchlistIds: string[];
}

export interface RandomMatchupFinishedResponse {
  token: string;
  winnerImdbItemId: string;
  compareFactorTypes: string[];
  genreNames: string[];
  watchlistIds: string[];
}

export interface InitialCreateMatchupPayload {
  watchlistIds?: string[];
  genreNames?: string[];
  compareFactorTypes?: string[];
}
import type { Generated } from "kysely";

export interface ItemElo {
  userId: string;
  imdbItemId: string;
  eloRating: Generated<number>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface ItemEloMatchup {
  userId: string;
  imdbItemId1: string;
  imdbItemId2: string;
  winnerImdbItemId: string;
  imdbGenreName: string | null;
  startedAt: Date;
  endedAt: Generated<Date>;
}

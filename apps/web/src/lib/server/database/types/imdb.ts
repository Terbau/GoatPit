import type { Generated } from "kysely";

export interface IMDBItem {
  id: string;
  title: string;
  plot: string;
  runtime: number | null;
  yearReleased: number | null;
  yearEnded: number | null;
  releasedAt: Date;
  numberOfEpisodes: number;
  certificate: string;
  starRating: number;
  votes: number;
  imageUrl: string;
  type: "movie" | "series";
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface IMDBCreator {
  id: string;
  name: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface IMDBStar {
  id: string;
  name: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface IMDBCreatorFilmography {
  creatorId: string;
  itemId: string;
}

export interface IMDBStarFilmography {
  starId: string;
  itemId: string;
}

export interface IMDBGenre {
  name: string;  // Unique
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface IMDBItemGenre {
  itemId: string;
  genreName: string;
}
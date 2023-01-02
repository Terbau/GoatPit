import { Item, PosterData, ImageData, RawSearchResultEntry, SearchResultEntry } from "./types";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const parseDate = (date: string): Date => {
  // Format "01 Jan 2000"
  const [day, month, year] = date.split(' ');
  return new Date(parseInt(year), months.indexOf(month), parseInt(day));
}

export const transformImageUrl = (url: string, width: number, height: number): string => {
  return url.replace(/_V1_/, `__V1_QL75_UX${width}_CR0,0,${width},${height}__.jpg`);
}

export const convertFromRawEntry = (raw: RawSearchResultEntry): SearchResultEntry => {
  return {
    id: raw.id,
    title: raw.l,
    type: raw.qid,
    yearReleased: raw.y,
    yearsRunning: raw.yr,
    image: convertImage(raw.i),
    rank: raw.rank,
    highlightedActors: raw.s,
  };
}

const convertPoster = (poster?: PosterData): PosterData | null => {
  if (poster) {
    return {
      height: poster.height,
      url: transformImageUrl(poster.url, poster.width, poster.height),
      width: poster.width,
    }
  }
  return null;
}

const convertImage = (image?: ImageData): ImageData | null => {
  if (image) {
    return {
      height: image.height,
      imageUrl: transformImageUrl(image.imageUrl, image.width, image.height),
      width: image.width,
    }
  }
  return null;
}

export const convertMovie = (obj: any): Item => {
  const [yearReleased, yearEnded] = obj.title.primary.year;

  const movie: Item = {
    id: obj.title.id,
    title: obj.title.primary.title,
    plot: obj.title.plot,
    runtime: obj.title.metadata.runtime,
    yearReleased: yearReleased ? parseInt(yearReleased) : null,
    yearEnded: yearEnded ? parseInt(yearEnded) : null,
    releasedAt: new Date(obj.title.metadata.release),
    genres: obj.title.metadata.genres,
    numberOfEpisodes: 1,
    certificate: obj.title.metadata.certificate,
    stats: {
      starRating: obj.starbar.aggregate,
      movieMeterRank: obj.title.movieMeterCurrentRank,
      votes: obj.starbar.votes,
    },
    creators: obj.title.credits.director.map((d: any) => ({
      id: d.href.split('/')[2],
      name: d.name,
    })),
    stars: obj.title.credits.star.map((s: any) => ({
      id: s.href.split('/')[2],
      name: s.name,
    })),
    poster: convertPoster(obj.title.poster),
    type: "movie",
  }

  return movie;
}

export const convertSeries = (obj: any): Item => {
  const [yearReleased, yearEnded] = obj.title.primary.year;

  const series: Item = {
    id: obj.title.id,
    title: obj.title.primary.title,
    plot: obj.title.plot,
    runtime: obj.title.metadata.runtime,
    yearReleased: yearReleased ? parseInt(yearReleased) : null,
    yearEnded: yearEnded ? parseInt(yearEnded) : null,
    releasedAt: new Date(obj.title.metadata.release),
    numberOfEpisodes: obj.title.metadata.numberOfEpisodes,
    genres: obj.title.metadata.genres,
    certificate: obj.title.metadata.certificate,
    stats: {
      starRating: obj.starbar.aggregate,
      movieMeterRank: obj.title.movieMeterCurrentRank,
      votes: obj.starbar.votes,
    },
    creators: obj.title.credits.creator.map((d: any) => ({
      id: d.href.split('/')[2],
      name: d.name,
    })),
    stars: obj.title.credits.star.map((s: any) => ({
      id: s.href.split('/')[2],
      name: s.name,
    })),
    poster: convertPoster(obj.title.poster),
    type: "series",
  }

  return series;
}
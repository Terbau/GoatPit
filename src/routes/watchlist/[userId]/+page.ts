import type { ExtendedWatchlistItem } from '$lib/server/functions';
// import { getDefaultWatchlistItemsByUserId, type ExtendedWatchlistItem } from '$lib/server/functions';
import type { Generated } from 'kysely';
import type { PageLoad } from './$types';

export interface Watchlist {}

export const load: PageLoad = async ({ params}) => {
  const userId = params.userId;


  // const items = await getDefaultWatchlistItemsByUserId(userId);

  // const newItems = await getDefaultWatchlistItemsByUserId(userId, { imdbItemIds: ['tt1567432']})
  // console.log(JSON.stringify(newItems, null, 2))

  return {
    userId: userId,
  }
  // const items: ExtendedWatchlistItem[] = [
  //   {
  //       "id": "c5bc03a3-102a-4b89-b4b2-a7a72ef515d8" as Generated<string>,
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt1130884",
  //       "createdAt": new Date("2022-12-26T20:10:45.593423+00:00"),
  //       "updatedAt": new Date("2022-12-26T20:10:45.593423+00:00"),
  //       "item": {
  //           "id": "tt1130884",
  //           "title": "Shutter Island",
  //           "plot": "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.",
  //           "runtime": 8280,
  //           "yearReleased": 2010,
  //           "yearEnded": null,
  //           "releasedAt": new Date("2010-02-19T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "R",
  //           "starRating": 8.2,
  //           "votes": 1313333,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BYzhiNDkyNzktNTZmYS00ZTBkLTk2MDAtM2U0YjU1MzgxZjgzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-26T20:10:45.517967+00:00"),
  //           "updatedAt": new Date("2022-12-26T20:10:45.517967+00:00")
  //       }
  //   },
  //   {
  //       "id": "5a4cae55-8b6e-48ce-840d-d755e40acb55",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt1375666",
  //       "createdAt": new Date("2022-12-26T20:18:56.842755+00:00"),
  //       "updatedAt": new Date("2022-12-26T20:18:56.842755+00:00"),
  //       "item": {
  //           "id": "tt1375666",
  //           "title": "Inception",
  //           "plot": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
  //           "runtime": 8880,
  //           "yearReleased": 2010,
  //           "yearEnded": null,
  //           "releasedAt": new Date("2010-07-16T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "PG-13",
  //           "starRating": 8.8,
  //           "votes": 2348053,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-26T20:18:56.770237+00:00"),
  //           "updatedAt": new Date("2022-12-26T20:18:56.770237+00:00")
  //       }
  //   },
  //   {
  //       "id": "12329dcf-8c49-4f71-9a22-047dc8f76275",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt0095016",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt0095016",
  //           "title": "Die Hard - Aksjon Skyskraper",
  //           "plot": "A New York City police officer tries to save his estranged wife and several others taken hostage by terrorists during a Christmas party at the Nakatomi Plaza in Los Angeles.",
  //           "runtime": 7920,
  //           "yearReleased": 1988,
  //           "yearEnded": null,
  //           "releasedAt": new Date("1988-07-20T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "",
  //           "starRating": 8.2,
  //           "votes": 881503,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BZjRlNDUxZjAtOGQ4OC00OTNlLTgxNmQtYTBmMDgwZmNmNjkxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   },
  //   {
  //       "id": "a0f90200-5d80-4ae1-8aec-aad40fbe7f82",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt0086190",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt0086190",
  //           "title": "Star Wars: Episode VI - Jedi-ridderen vender tilbake",
  //           "plot": "After a daring mission to rescue Han Solo from Jabba the Hutt, the Rebels dispatch to Endor to destroy the second Death Star. Meanwhile, Luke struggles to help Darth Vader back from the dark side without falling into the Emperor&#39;s trap.",
  //           "runtime": 7860,
  //           "yearReleased": 1983,
  //           "yearEnded": null,
  //           "releasedAt": new Date("1983-05-25T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "PG",
  //           "starRating": 8.3,
  //           "votes": 1053983,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BOWZlMjFiYzgtMTUzNC00Y2IzLTk1NTMtZmNhMTczNTk0ODk1XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   },
  //   {
  //       "id": "c9035af4-bcad-4b16-9bcd-fe2652a281c6",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt4154796",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt4154796",
  //           "title": "Avengers: Endgame",
  //           "plot": "After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos&#39; actions and restore balance to the universe.",
  //           "runtime": 10860,
  //           "yearReleased": 2019,
  //           "yearEnded": null,
  //           "releasedAt": new Date("2019-04-26T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "PG-13",
  //           "starRating": 8.4,
  //           "votes": 1128051,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   },
  //   {
  //       "id": "ee73b7cb-7f93-4660-812f-22c61d87150b",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt8579674",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt8579674",
  //           "title": "1917",
  //           "plot": "April 6th, 1917. As an infantry battalion assembles to wage war deep in enemy territory, two soldiers are assigned to race against time and deliver a message that will stop 1,600 men from walking straight into a deadly trap.",
  //           "runtime": 7140,
  //           "yearReleased": 2019,
  //           "yearEnded": null,
  //           "releasedAt": new Date("2020-01-10T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "R",
  //           "starRating": 8.2,
  //           "votes": 589449,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BOTdmNTFjNDEtNzg0My00ZjkxLTg1ZDAtZTdkMDc2ZmFiNWQ1XkEyXkFqcGdeQXVyNTAzNzgwNTg@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   },
  //   {
  //       "id": "f28368cb-3aa3-4501-9447-c30eedf03d95",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt0119217",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt0119217",
  //           "title": "Den enestående Will Hunting",
  //           "plot": "Will Hunting, a janitor at M.I.T., has a gift for mathematics, but needs help from a psychologist to find direction in his life.",
  //           "runtime": 7560,
  //           "yearReleased": 1997,
  //           "yearEnded": null,
  //           "releasedAt": new Date("1998-01-09T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "R",
  //           "starRating": 8.3,
  //           "votes": 970228,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BOTI0MzcxMTYtZDVkMy00NjY1LTgyMTYtZmUxN2M3NmQ2NWJhXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   },
  //   {
  //       "id": "b068a6ae-9bd0-4113-92ab-cbc214d03d9f",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt0361748",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt0361748",
  //           "title": "Inglourious Basterds",
  //           "plot": "In Nazi-occupied France during World War II, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner&#39;s vengeful plans for the same.",
  //           "runtime": 9180,
  //           "yearReleased": 2009,
  //           "yearEnded": null,
  //           "releasedAt": new Date("2009-08-20T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "R",
  //           "starRating": 8.3,
  //           "votes": 1447618,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BOTJiNDEzOWYtMTVjOC00ZjlmLWE0NGMtZmE1OWVmZDQ2OWJhXkEyXkFqcGdeQXVyNTIzOTk5ODM@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   },
  //   {
  //       "id": "3a78b97a-527c-4c85-abda-7edf8d3c128a",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt1049413",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt1049413",
  //           "title": "Se opp",
  //           "plot": "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, inadvertently taking a young stowaway.",
  //           "runtime": 5760,
  //           "yearReleased": 2009,
  //           "yearEnded": null,
  //           "releasedAt": new Date("2009-05-29T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "PG",
  //           "starRating": 8.3,
  //           "votes": 1044139,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BMTk3NDE2NzI4NF5BMl5BanBnXkFtZTgwNzE1MzEyMTE@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   },
  //   {
  //       "id": "599309a0-5419-4abb-a031-b1d8dac7b930",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt0114709",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt0114709",
  //           "title": "Toy Story",
  //           "plot": "A cowboy doll is profoundly threatened and jealous when a new spaceman action figure supplants him as top toy in a boy&#39;s bedroom.",
  //           "runtime": 4860,
  //           "yearReleased": 1995,
  //           "yearEnded": null,
  //           "releasedAt": new Date("1995-11-22T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "",
  //           "starRating": 8.3,
  //           "votes": 993940,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BMDU2ZWJlMjktMTRhMy00ZTA5LWEzNDgtYmNmZTEwZTViZWJkXkEyXkFqcGdeQXVyNDQ2OTk4MzI@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   },
  //   {
  //       "id": "a97e5018-174d-4e19-a8e7-af2e71cab250",
  //       "watchlistId": "8ea112ec-1a14-43df-9c27-3e210a025486",
  //       "imdbItemId": "tt0105236",
  //       "createdAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "updatedAt": new Date("2022-12-27T01:56:48.025065+00:00"),
  //       "item": {
  //           "id": "tt0105236",
  //           "title": "De hensynsløse",
  //           "plot": "When a simple jewelry heist goes horribly wrong, the surviving criminals begin to suspect that one of them is a police informant.",
  //           "runtime": 5940,
  //           "yearReleased": 1992,
  //           "yearEnded": null,
  //           "releasedAt": new Date("1992-09-02T00:00:00+00:00"),
  //           "numberOfEpisodes": 1,
  //           "certificate": "R",
  //           "starRating": 8.3,
  //           "votes": 1018529,
  //           "imageUrl": "https://m.media-amazon.com/images/M/MV5BZmExNmEwYWItYmQzOS00YjA5LTk2MjktZjEyZDE1Y2QxNjA1XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
  //           "type": "movie",
  //           "createdAt": new Date("2022-12-27T01:56:47.914068+00:00"),
  //           "updatedAt": new Date("2022-12-27T01:56:47.914068+00:00")
  //       }
  //   }
  // ]


  // return {
  //   watchlist: {
  //     id: "jdgkalsjgkdlsjagødskgjøskgjsag",
  //     name: "Default Watchlist",
  //     description: "This is the default watchlist",
  //     isPublic: true,
  //     isDefault: true,
  //     userId: params.userId,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     items: items,
  //   }
  // }
};
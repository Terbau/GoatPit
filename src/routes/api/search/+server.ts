import { json, error } from '@sveltejs/kit';
import { searchIMDB } from '$lib/server/functions';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('query');
  if (!query) throw error(400, 'Missing query parameter');

  const result = await searchIMDB(query);
  return json(result);
}

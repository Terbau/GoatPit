import type { PageServerLoad } from './$types';
import { getWatchlistByUserId } from '@goatpit/imdb';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.validate();
	if (!session) {
		console.log("Not logged in");
	}

	return {};
};
import { error, type Actions } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const email = form.get('email');
		const password = form.get('password');

		if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
			throw error(400, {
				message: 'Invalid form data'
			});
		}

		try {
			const user = await auth.authenticateUser('email', email, password);
			const session = await auth.createSession(user.id);
			locals.setSession(session);
		} catch (e) {
			const exc = e as Error;
			if (
				exc.message === 'AUTH_INVALID_PROVIDER_ID' ||
				exc.message === 'AUTH_INVALID_PASSWORD'
			) {
				throw error(400, {
					message: 'Incorrect email or password.'
				});
			}
      
			// database connection error
			console.error(exc);
			throw error(500, {
				message: 'Unknown error occurred'
			});
		}
	}
};
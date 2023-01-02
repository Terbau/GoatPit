import lucia from 'lucia-auth';
import { dev } from '$app/environment';
import { db } from '$lib/server/database';
import google from '@lucia-auth/oauth/google';
import { 
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	DOMAIN,
} from '$env/static/private';
import adapter from './lucia/kysely-adapter';


export const auth = lucia({
	adapter: adapter(db),
	env: dev ? 'DEV' : 'PROD',
	transformUserData: (userData) => {
		console.log("userId", userData.id)
		return {
			id: userData.id,
			email: userData.email,
			provider: userData.provider,
			createdAt: userData.created_at,
		};
	}
});

export const googleAuth = google(auth, {
	clientId: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	redirectUri: `http://${DOMAIN}/api/oauth/google/callback`,
	scope: ['email'],
});

export type Auth = typeof auth;

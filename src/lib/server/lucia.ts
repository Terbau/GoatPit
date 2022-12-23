import lucia from 'lucia-auth';
import adapterKysely from '@lucia-auth/adapter-kysely';
import { dev } from '$app/environment';
import { db } from '$lib/server/database';
import google from '@lucia-auth/oauth/google';
import { 
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	DOMAIN,
} from '$env/static/private';


export const auth = lucia({
	adapter: adapterKysely(db),
	env: dev ? 'DEV' : 'PROD',
	transformUserData: (userData) => {
		return {
			userId: userData.id,
			email: userData.email,
			provider: userData.provider,
			createdAt: userData.createdAt,
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

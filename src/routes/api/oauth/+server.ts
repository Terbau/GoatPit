import type { RequestHandler } from './$types';
import { googleAuth } from '$lib/server/lucia';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
  const provider = url.searchParams.get('provider');

  const { session, user } = await locals.validateUser();
  console.log(session, user)
  if (session && user.provider == provider) {
    // User is already logged in with this provider
    return new Response(null, {
      status: 302,
      headers: {
        location: '/',
      },
    });
  }

  if (provider == "google") {
    const [authorizationUrl, state] = googleAuth.getAuthorizationUrl();
    cookies.set('oauth_state', state, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60,
    });

    return new Response(null, {
      status: 302,
      headers: {
        location: authorizationUrl,
      },
    });
  }

  return new Response(null, {
    status: 400,
  });
}
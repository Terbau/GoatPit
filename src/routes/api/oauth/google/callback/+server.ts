import { auth, googleAuth } from '$lib/server/lucia';
import type { RequestHandler } from '../$types';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('oauth_state');

  if (storedState !== state || !code || !state)
    throw new Response(null, { status: 401 });

  try {
    const { existingUser, providerUser, createUser } = await googleAuth.validateCallback(code);
    console.log(existingUser);
    console.log(providerUser);
    const user = existingUser ?? (await createUser({
      email: providerUser.email,
      provider: 'google',
      created_at: new Date(),
    }));

    const session = await auth.createSession(user.id);
    locals.setSession(session);
    return new Response(null, {
      status: 302,
      headers: {
        location: '/',
      },
    });
  } catch (err) {
    console.log(err);
    return new Response(null, { status: 500 });
  }
}

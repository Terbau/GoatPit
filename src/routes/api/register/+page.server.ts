import { auth } from '$lib/server/lucia';
import { isValidEmail } from '$lib/utils';
import { error, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const email = form.get('email');
    const password = form.get('password');

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      throw error(400, {
        message: 'Invalid form data',
      });
    }

    if (!isValidEmail(email)) {
      throw error(400, {
        message: 'Invalid email address',
        field: 'email',
      });
    }

    // Check password strength
    if (password.length < 8) {
      throw error(400, {
        message: 'Password must be at least 8 characters long',
        field: 'password',
      });
    }

    try {
      const user = await auth.createUser("email", email, {
        password,
        attributes: {
          email: email,
          provider: "email",
          createdAt: new Date(),
        },
      });
      const session = await auth.createSession(user.userId);
      locals.setSession(session);
    } catch (e) {
      const exc = e as Error;
      if (exc.message === "AUTH_DUPLICATE_PROVIDER_ID" || exc.message.includes("user_email_key")) {
        throw error(400, {
          message: 'Email already taken',
          field: 'email',
        });
      }

      console.error(exc);
      throw error(500, {
        message: 'Internal server error',
      });
    }
  }
}
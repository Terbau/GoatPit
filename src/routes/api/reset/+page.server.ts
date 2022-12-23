import { type Actions, error } from "@sveltejs/kit";
import jwt, { type JwtPayload, type Secret } from "jsonwebtoken";
import { JWT_SECRET } from '$env/static/private';
import { auth } from "$lib/server/lucia";


export const actions: Actions = {
  default: async ({ request }) => {
    // Handle reset password
    const form = await request.formData();
    const password = form.get('password');
    const token = form.get('token');

    if (!password || !token || typeof password !== 'string' || typeof token !== 'string') {
      throw error(400, {
        message: 'Invalid form data',
      });
    }

    if (password.length < 8) {
      throw error(400, {
        message: 'Password must be at least 8 characters long',
        field: 'password',
      });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET as Secret) as JwtPayload;
    } catch (err) {
      throw error(400, {
        alertMessage: 'Token is invalid or has expired',
      });
    }

    const id = decoded.id;
    await auth.updateUserPassword(id, password);
  }
}
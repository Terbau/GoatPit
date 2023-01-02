import { db } from '$lib/server/database';
import { isValidEmail } from '$lib/utils';
import { error, type Actions } from '@sveltejs/kit';
import jwt, { type Secret } from 'jsonwebtoken';
import { JWT_SECRET, SENDGRID_SENDER, DOMAIN } from '$env/static/private';
import type { MailDataRequired } from '@sendgrid/mail';
import { sendMessage } from '$lib/server/sendgrid';


export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const email = form.get('email');

    if (!email || typeof email !== 'string') {
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

    const user = await db.selectFrom('user')
      .select('id')
      .select('provider')
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      throw error(400, {
        alertMessage: 'No email user with that email address exists',
      });
    }

    if(user.provider !== 'email') {
      throw error(400, {
        alertMessage: 'You cannot reset the password for an external registered account',
      });
    }

    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET as Secret,
      { expiresIn: '30m' },
    );

    const message: MailDataRequired = {
      to: { email: email },
      from: SENDGRID_SENDER,
      subject: "GoatPit Password Reset",
      html: `
        <p>Click the link below to reset your password.</p>
        <p><a href="http://${DOMAIN}/reset?token=${token}">Reset Password</a></p>
        <br/>
        <p>This link will expire in 30 minutes.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
      `,
    }

    try {
      await sendMessage(message);
    } catch (err) {
      console.error(err);
      throw error(500, {
        alertMessage: 'Failed to send email',
      });
    }
  }
}

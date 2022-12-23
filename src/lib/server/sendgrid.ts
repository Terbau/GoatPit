import sgMail, { type MailDataRequired } from '@sendgrid/mail';
import { SENDGRID_API_KEY, SENDGRID_SENDER } from '$env/static/private';

export const sendMessage = async (message: Partial<MailDataRequired>) => {
  try {
    sgMail.setApiKey(SENDGRID_API_KEY)
    const completeMessage = <MailDataRequired> {
      from: SENDGRID_SENDER,
      ...message
    }
    await sgMail.send(completeMessage)
  } catch (errSendingMail) {
    console.error(errSendingMail)
  }
}


import { transporter } from "../config/mailer";

interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

export const sendEmailService = async ({
  to,
  subject,
  body,
}: SendEmailInput) => {
  const result = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: body,
  });

  return result;
};

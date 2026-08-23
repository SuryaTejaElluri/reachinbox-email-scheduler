import nodemailer from "nodemailer";
import emailTransporter from "../config/email.config";

interface SendMailParams {
  to: string;
  subject: string;
  body: string;
}

export const sendMailService = async ({
  to,
  subject,
  body,
}: SendMailParams) => {
  console.log(`[MailSender] Sending email to: ${to} | Subject: "${subject}"`);

  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "no-reply@reachinbox.local";

  const result = await emailTransporter.sendMail({
    from,
    to,
    subject,
    html: body,
  });

  console.log(
    `[MailSender] Sent successfully to ${to}. MessageId: ${result.messageId}`
  );

  const previewUrl = nodemailer.getTestMessageUrl(result);
  if (previewUrl) {
    console.log("[MailSender] Preview URL:", previewUrl);
  }

  return result;
};

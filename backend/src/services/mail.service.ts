import nodemailer from "nodemailer";
import emailTransporter, { getTransporter } from "../config/email.config";

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
  // Use the async transporter which handles Ethereal fallback
  let transporter: nodemailer.Transporter;
  try {
    transporter = await getTransporter();
  } catch {
    // Fall back to the eagerly-created one
    transporter = emailTransporter;
  }

  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "no-reply@reachinbox.local";

  const result = await transporter.sendMail({
    from,
    to,
    subject,
    html: body,
    text: body.replace(/<[^>]*>/g, ""), // strip HTML for text part
  });

  console.log(
    `[MailService] Sent to ${to} | MessageId: ${result.messageId}`
  );

  // Show Ethereal preview URL if available
  const previewUrl = nodemailer.getTestMessageUrl(result);
  if (previewUrl) {
    console.log(`[MailService] Preview: ${previewUrl}`);
  }

  return result;
};

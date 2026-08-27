import nodemailer from "nodemailer";

/**
 * Single SMTP transporter used across the entire application.
 *
 * Reads SMTP_PASSWORD (matching .env key).
 * Falls back to Ethereal test account creation if no SMTP vars are set.
 */
let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function createTransporter(): Promise<nodemailer.Transporter> {
  // If SMTP env vars are configured, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "",
      },
    });

    console.log(
      `[Mailer] Using SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
    );
    return transport;
  }

  // Fallback: create an Ethereal test account
  console.log("[Mailer] No SMTP configured. Creating Ethereal test account…");
  const testAccount = await nodemailer.createTestAccount();

  const transport = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log(`[Mailer] Ethereal account: ${testAccount.user}`);
  console.log(`[Mailer] Preview URL base: https://ethereal.email`);

  return transport;
}

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

// Eagerly-created synchronous transporter for backward compat
// (will be undefined until getTransporter() resolves)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "",
  },
});

export default emailTransporter;

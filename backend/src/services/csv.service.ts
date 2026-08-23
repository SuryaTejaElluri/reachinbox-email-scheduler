import { parse } from "csv-parse/sync";

import { prisma } from "../config/prisma";
import { emailQueue } from "../queues/email.queue";
import { isValidEmail } from "../utils/email.validator";

interface CsvRecipient {
  name?: string;
  email: string;
}

interface ImportCsvResult {
  created: number;
  duplicates: number;
  invalid: number;
  recipients: string[];
  invalidEmails: string[];
  duplicateEmails: string[];
}

export const importRecipientsFromCsvService = async ({
  campaignId,
  userId,
  buffer,
}: {
  campaignId: string;
  userId: string;
  buffer: Buffer;
}): Promise<ImportCsvResult> => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (campaign.userId !== userId) {
    throw new Error("Unauthorized campaign access");
  }

  if (!buffer || buffer.length === 0) {
    throw new Error("CSV file is empty");
  }

  let rows: CsvRecipient[];

  try {
    rows = parse(buffer.toString("utf-8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as CsvRecipient[];
  } catch {
    throw new Error("Invalid CSV file");
  }

  if (!rows.length) {
    throw new Error("CSV contains no data");
  }

  const invalidEmails: string[] = [];
  const duplicateEmails: string[] = [];

  const uniqueEmails = new Set<string>();

  for (const row of rows) {
    const rawEmail = row.email;

    if (!rawEmail || typeof rawEmail !== "string") {
      invalidEmails.push("");
      continue;
    }

    const email = rawEmail.trim().toLowerCase();

    if (!isValidEmail(email)) {
      invalidEmails.push(email);
      continue;
    }

    if (uniqueEmails.has(email)) {
      duplicateEmails.push(email);
      continue;
    }

    uniqueEmails.add(email);
  }

  const recipients = Array.from(uniqueEmails);

  let created = 0;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];

    if (!recipient) {
      continue;
    }

    const existing = await prisma.scheduledEmail.findFirst({
      where: {
        campaignId,
        to: recipient,
      },
    });

    if (existing) {
      duplicateEmails.push(recipient);
      continue;
    }

    const scheduledAt = new Date(
      campaign.startTime.getTime() +
        i * campaign.delaySeconds * 1000
    );

    const scheduledEmail = await prisma.scheduledEmail.create({
      data: {
        to: recipient,
        subject: campaign.subject,
        body: campaign.body,
        scheduledAt,
        campaignId,
      },
    });

    const delay = Math.max(
      0,
      scheduledAt.getTime() - Date.now()
    );

    await emailQueue.add(
      "send-email" as any,
      {
        scheduledEmailId: scheduledEmail.id,
        recipient: scheduledEmail.to,
        subject: scheduledEmail.subject,
        body: scheduledEmail.body,
        campaignId,
        userId,
      },
      {
        delay,
        jobId: `email-${scheduledEmail.id}`,
      }
    );

    created++;
  }

  return {
    created,
    duplicates: duplicateEmails.length,
    invalid: invalidEmails.length,
    recipients,
    invalidEmails,
    duplicateEmails,
  };
};

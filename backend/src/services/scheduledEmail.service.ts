import { prisma } from "../config/prisma";
import { emailQueue } from "../queues/email.queue";

interface ScheduleEmailData {
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: Date;
  campaignId: string;
  userId: string;
}

export const createScheduledEmailService = async (
  data: ScheduleEmailData
) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: data.campaignId,
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (campaign.userId !== data.userId) {
    throw new Error("Unauthorized campaign access");
  }

  const existing = await prisma.scheduledEmail.findFirst({
    where: {
      campaignId: data.campaignId,
      to: data.recipient,
    },
  });

  if (existing) {
    return existing;
  }

  const scheduledEmail =
    await prisma.scheduledEmail.create({
      data: {
        to: data.recipient,
        subject: data.subject,
        body: data.body,
        scheduledAt: data.scheduledAt,
        campaignId: data.campaignId,
      },
    });

  const delay = Math.max(
    0,
    data.scheduledAt.getTime() - Date.now()
  );

  await emailQueue.add(
    "send-email" as any,
    {
      scheduledEmailId: scheduledEmail.id,
      recipient: scheduledEmail.to,
      subject: scheduledEmail.subject,
      body: scheduledEmail.body,
      campaignId: scheduledEmail.campaignId,
      userId: data.userId,
    },
    {
      delay,
      jobId: `email-${scheduledEmail.id}`,
    }
  );

  return scheduledEmail;
};

export const getScheduledEmailsService = async (
  userId?: string
) => {
  const where = userId
    ? {
        campaign: {
          userId,
        },
      }
    : {};

  return prisma.scheduledEmail.findMany({
    where,

    include: {
      campaign: true,
    },

    orderBy: {
      scheduledAt: "asc",
    },
  });
};

export const getScheduledEmailByIdService = async (
  id: string
) => {
  return prisma.scheduledEmail.findUnique({
    where: {
      id,
    },
    include: {
      campaign: true,
    },
  });
};


export const scheduleCampaignEmailsService = async ({
  campaignId,
  userId,
  recipients,
}: {
  campaignId: string;
  userId: string;
  recipients: string[];
}) => {
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

  const uniqueRecipients = [
    ...new Set(
      recipients
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  const results = [];

  for (let i = 0; i < uniqueRecipients.length; i++) {
    const recipient = uniqueRecipients[i]?.trim();

    if (!recipient) {
      continue;
    }

    const scheduledAt = new Date(
      campaign.startTime.getTime() +
        i * campaign.delaySeconds * 1000
    );

    const existing =
      await prisma.scheduledEmail.findFirst({
        where: {
          campaignId,
          to: recipient,
        },
      });

    if (existing) {
      results.push(existing);
      continue;
    }

    const email =
      await prisma.scheduledEmail.create({
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
        scheduledEmailId: email.id,
        recipient,
        subject: campaign.subject,
        body: campaign.body,
        campaignId,
        userId,
      },
      {
        delay,
        jobId: `email-${email.id}`,
      }
    );

    results.push(email);
  }

  return results;
};
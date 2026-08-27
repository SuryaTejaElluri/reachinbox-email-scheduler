import { prisma } from "../config/prisma";
import { emailQueue } from "../queues/email.queue";

export interface CreateCampaignData {
  subject: string;
  body: string;
  startTime: Date;
  delaySeconds: number;
  hourlyLimit: number;
  userId: string;
  recipients?: string[];
}

export interface UpdateCampaignData {
  subject?: string;
  body?: string;
  startTime?: Date;
  delaySeconds?: number;
  hourlyLimit?: number;
}

export const createCampaignService = async (
  data: CreateCampaignData
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: data.userId,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const recipients = data.recipients || [];

  // Create campaign + scheduled email records in a transaction
  const campaign = await prisma.$transaction(async (tx) => {
    const camp = await tx.campaign.create({
      data: {
        subject: data.subject,
        body: data.body,
        startTime: data.startTime,
        delaySeconds: data.delaySeconds,
        hourlyLimit: data.hourlyLimit,
        userId: data.userId,
      },
    });

    if (recipients.length > 0) {
      await tx.scheduledEmail.createMany({
        data: recipients.map((to: string, index: number) => ({
          campaignId: camp.id,
          to,
          subject: data.subject,
          body: data.body,
          status: "SCHEDULED" as const,
          scheduledAt: new Date(
            data.startTime.getTime() + index * data.delaySeconds * 1000
          ),
        })),
      });
    }

    return camp;
  });

  // After transaction commits, enqueue BullMQ jobs for each email
  if (recipients.length > 0) {
    const createdEmails = await prisma.scheduledEmail.findMany({
      where: { campaignId: campaign.id },
      orderBy: { scheduledAt: "asc" },
    });

    for (const email of createdEmails) {
      const delay = Math.max(
        0,
        (email.scheduledAt?.getTime() ?? Date.now()) - Date.now()
      );

      await emailQueue.add(
        "send-email",
        {
          scheduledEmailId: email.id,
          recipient: email.to,
          subject: email.subject,
          body: email.body,
          campaignId: email.campaignId,
          userId: data.userId,
        },
        {
          delay,
          jobId: `email-${email.id}`,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 30_000,
          },
        }
      );
    }

    console.log(
      `[Campaign] Enqueued ${createdEmails.length} BullMQ jobs for campaign ${campaign.id}`
    );
  }

  return campaign;
};

export const getCampaignByIdService = async (id: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      emails: true,
    },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  return campaign;
};

export const getAllCampaignsService = async () => {
  return prisma.campaign.findMany({
    include: {
      user: true,
      _count: {
        select: {
          emails: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getCampaignsByUserService = async (
  userId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return prisma.campaign.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: {
          emails: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateCampaignService = async (
  id: string,
  data: UpdateCampaignData
) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id,
    },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  return prisma.campaign.update({
    where: {
      id,
    },
    data,
  });
};

export const updateCampaignStatusService = async (
  id: string,
  status: "SCHEDULED" | "COMPLETED" | "FAILED"
) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id,
    },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  return prisma.campaign.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};

export const deleteCampaignService = async (id: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id,
    },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  const emailCount = await prisma.scheduledEmail.count({
    where: {
      campaignId: id,
    },
  });

  if (emailCount > 0) {
    throw new Error("CAMPAIGN_HAS_EMAILS");
  }

  return prisma.campaign.delete({
    where: {
      id,
    },
  });
};
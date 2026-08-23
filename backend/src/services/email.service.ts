import { prisma } from "../config/prisma";
import { EmailStatus } from "../generated/prisma/enums";

// =====================================================
// CREATE EMAIL
// =====================================================

export const createEmailService = async (data: {
  campaignId: string;
  to: string;
  subject: string;
  body: string;
}) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: data.campaignId,
    },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  const email = await prisma.scheduledEmail.create({
    data: {
      campaignId: data.campaignId,
      to: data.to,
      subject: data.subject,
      body: data.body,
      status: EmailStatus.PENDING,
    },
  });

  return email;
};

// =====================================================
// GET EMAIL BY ID
// =====================================================

export const getEmailByIdService = async (
  id: string
) => {
  const email = await prisma.scheduledEmail.findUnique({
    where: {
      id,
    },
  });

  if (!email) {
    throw new Error("EMAIL_NOT_FOUND");
  }

  return email;
};

// =====================================================
// GET ALL EMAILS OF CAMPAIGN
// =====================================================

export const getEmailsByCampaignService = async (
  campaignId: string
) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  return prisma.scheduledEmail.findMany({
    where: {
      campaignId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

// =====================================================
// UPDATE EMAIL
// =====================================================

export const updateEmailService = async (
  id: string,
  data: {
    to?: string;
    subject?: string;
    body?: string;
  }
) => {
  const email = await prisma.scheduledEmail.findUnique({
    where: {
      id,
    },
  });

  if (!email) {
    throw new Error("EMAIL_NOT_FOUND");
  }

  if (
    email.status === EmailStatus.SENT ||
    email.status === EmailStatus.SENDING
  ) {
    throw new Error("EMAIL_CANNOT_BE_UPDATED");
  }

  return prisma.scheduledEmail.update({
    where: {
      id,
    },
    data,
  });
};

// =====================================================
// DELETE EMAIL
// =====================================================

export const deleteEmailService = async (
  id: string
) => {
  const email = await prisma.scheduledEmail.findUnique({
    where: {
      id,
    },
  });

  if (!email) {
    throw new Error("EMAIL_NOT_FOUND");
  }

  if (email.status === EmailStatus.SENDING) {
    throw new Error("EMAIL_BEING_SENT");
  }

  if (email.status === EmailStatus.SENT) {
    throw new Error("EMAIL_ALREADY_SENT");
  }

  await prisma.scheduledEmail.delete({
    where: {
      id,
    },
  });

  return true;
};

// =====================================================
// BULK CREATE EMAILS FOR CAMPAIGN
// =====================================================

export const createEmailsForCampaignService = async (
  campaignId: string,
  recipients: string[]
) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  const emails = recipients.map((to, index) => ({
    campaignId,
    to,
    subject: campaign.subject,
    body: campaign.body,
    status: EmailStatus.SCHEDULED,
    scheduledAt: new Date(
      campaign.startTime.getTime() +
        index * campaign.delaySeconds * 1000
    ),
  }));

  return prisma.scheduledEmail.createMany({
    data: emails,
  });
};

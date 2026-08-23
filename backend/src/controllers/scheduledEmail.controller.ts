import { Request, Response } from "express";

import {
  getScheduledEmailsService,
  getScheduledEmailByIdService,
  scheduleCampaignEmailsService,
} from "../services/scheduledEmail.service";

import { prisma } from "../config/prisma";

/**
 * GET /api/emails/scheduled
 *
 * Returns all emails that are currently scheduled.
 */
export const getScheduledEmails = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      typeof req.query.userId === "string"
        ? req.query.userId
        : undefined;

    const emails = await getScheduledEmailsService(userId);

    const scheduledEmails = emails.filter(
      (email) => email.status === "SCHEDULED"
    );

    return res.status(200).json({
      success: true,
      count: scheduledEmails.length,
      emails: scheduledEmails,
    });
  } catch (error) {
    console.error(
      "Get scheduled emails error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch scheduled emails",
    });
  }
};

/**
 * GET /api/emails/sent
 *
 * Returns all successfully sent emails.
 */
export const getSentEmails = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      typeof req.query.userId === "string"
        ? req.query.userId
        : undefined;

    const emails =
      await getScheduledEmailsService(userId);

    const sentEmails = emails.filter(
      (email) => email.status === "SENT"
    );

    return res.status(200).json({
      success: true,
      count: sentEmails.length,
      emails: sentEmails,
    });
  } catch (error) {
    console.error(
      "Get sent emails error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sent emails",
    });
  }
};

/**
 * GET /api/emails/failed
 *
 * Returns emails that failed to send.
 */
export const getFailedEmails = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      typeof req.query.userId === "string"
        ? req.query.userId
        : undefined;

    const emails =
      await getScheduledEmailsService(userId);

    const failedEmails = emails.filter(
      (email) => email.status === "FAILED"
    );

    return res.status(200).json({
      success: true,
      count: failedEmails.length,
      emails: failedEmails,
    });
  } catch (error) {
    console.error(
      "Get failed emails error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch failed emails",
    });
  }
};

/**
 * GET /api/emails/:id
 *
 * Returns one scheduled email.
 */
export const getScheduledEmailById = async (
  req: Request,
  res: Response
) => {
  try {
    const id =
      typeof req.params.id === "string"
        ? req.params.id
        : undefined;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Email ID is required",
      });
    }

    const email =
      await getScheduledEmailByIdService(id);

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    return res.status(200).json({
      success: true,
      email,
    });
  } catch (error) {
    console.error(
      "Get email by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch email",
    });
  }
};

/**
 * GET /api/emails/stats
 *
 * Dashboard email statistics.
 */
export const getEmailStats = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      typeof req.query.userId === "string"
        ? req.query.userId
        : undefined;

    const where = userId
      ? {
          campaign: {
            userId,
          },
        }
      : {};

    const [
      scheduled,
      processing,
      sent,
      failed,
    ] = await Promise.all([
      prisma.scheduledEmail.count({
        where: {
          ...where,
          status: "SCHEDULED",
        },
      }),

      prisma.scheduledEmail.count({
        where: {
          ...where,
          status: "SENDING",
        },
      }),

      prisma.scheduledEmail.count({
        where: {
          ...where,
          status: "SENT",
        },
      }),

      prisma.scheduledEmail.count({
        where: {
          ...where,
          status: "FAILED",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        scheduled,
        processing,
        sent,
        failed,
        total:
          scheduled +
          processing +
          sent +
          failed,
      },
    });
  } catch (error) {
    console.error(
      "Get email stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch email statistics",
    });
  }
};

export const scheduleCampaignEmails = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      campaignId,
      userId,
      recipients,
    } = req.body;

    if (!campaignId || !userId) {
      return res.status(400).json({
        success: false,
        message: "campaignId and userId are required",
      });
    }

    if (
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one recipient is required",
      });
    }

    const emails =
      await scheduleCampaignEmailsService({
        campaignId,
        userId,
        recipients,
      });

    return res.status(201).json({
      success: true,
      message: "Emails scheduled successfully",
      count: emails.length,
      emails,
    });
  } catch (error) {
    console.error(
      "Schedule campaign emails error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to schedule emails",
    });
  }
};
import { Request, Response } from "express";

import {
  createCampaignService,
  getCampaignByIdService,
  getCampaignsByUserService,
  updateCampaignService,
  updateCampaignStatusService,
  deleteCampaignService,
} from "../services/campaign.service";

import { createEmailsForCampaignService } from "../services/email.service";

const isValidId = (
  id: string | string[] | undefined
): id is string => {
  return typeof id === "string" && id.length > 0;
};

const getAuthenticatedUserId = (
  req: Request
): string | null => {
  return req.userId ?? null;
};

// =====================================================
// CREATE CAMPAIGN
// POST /api/campaigns
// =====================================================
export const createCampaign = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      subject,
      body,
      startTime,
      delaySeconds,
      hourlyLimit,
      recipients,
    } = req.body;

    if (
      !subject ||
      !body ||
      !startTime ||
      delaySeconds === undefined ||
      hourlyLimit === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "subject, body, startTime, delaySeconds and hourlyLimit are required",
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

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const invalidRecipients = recipients.filter(
      (email: unknown) =>
        typeof email !== "string" ||
        !emailRegex.test(email)
    );

    if (invalidRecipients.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more invalid recipient emails",
        invalidRecipients,
      });
    }

    const parsedStartTime = new Date(startTime);

    if (isNaN(parsedStartTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startTime",
      });
    }

    if (
      typeof delaySeconds !== "number" ||
      delaySeconds < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "delaySeconds must be a non-negative number",
      });
    }

    if (
      typeof hourlyLimit !== "number" ||
      hourlyLimit <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "hourlyLimit must be greater than 0",
      });
    }

    const campaign = await createCampaignService({
      subject,
      body,
      startTime: parsedStartTime,
      delaySeconds,
      hourlyLimit,
      userId,
      recipients,
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error: any) {
    console.error("Create campaign error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create campaign",
    });
  }
};

// =====================================================
// GET ALL CAMPAIGNS
// GET /api/campaigns
// =====================================================
export const getAllCampaigns = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const campaigns =
      await getCampaignsByUserService(userId);

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    console.error("Get campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get campaigns",
    });
  }
};

// =====================================================
// GET CAMPAIGN BY ID
// GET /api/campaigns/:id
// =====================================================
export const getCampaignById = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    const campaign =
      await getCampaignByIdService(id);

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this campaign",
      });
    }

    return res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    if (error.message === "CAMPAIGN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    console.error("Get campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get campaign",
    });
  }
};

// =====================================================
// GET CAMPAIGNS BY USER
// GET /api/campaigns/user/:userId
// =====================================================
export const getCampaignsByUser = async (
  req: Request,
  res: Response
) => {
  try {
    const authenticatedUserId =
      getAuthenticatedUserId(req);

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const requestedUserId = req.params.userId;

    if (!isValidId(requestedUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message:
          "You can only access your own campaigns",
      });
    }

    const campaigns =
      await getCampaignsByUserService(
        authenticatedUserId
      );

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error(
      "Get user campaigns error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get user campaigns",
    });
  }
};

// =====================================================
// UPDATE CAMPAIGN
// PATCH /api/campaigns/:id
// =====================================================
export const updateCampaign = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    const campaign =
      await getCampaignByIdService(id);

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this campaign",
      });
    }

    const {
      subject,
      body,
      startTime,
      delaySeconds,
      hourlyLimit,
    } = req.body;

    if (
      subject === undefined &&
      body === undefined &&
      startTime === undefined &&
      delaySeconds === undefined &&
      hourlyLimit === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const updateData: {
      subject?: string;
      body?: string;
      startTime?: Date;
      delaySeconds?: number;
      hourlyLimit?: number;
    } = {};

    if (subject !== undefined) {
      updateData.subject = subject;
    }

    if (body !== undefined) {
      updateData.body = body;
    }

    if (startTime !== undefined) {
      const parsedDate = new Date(startTime);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startTime",
        });
      }

      updateData.startTime = parsedDate;
    }

    if (delaySeconds !== undefined) {
      if (
        typeof delaySeconds !== "number" ||
        delaySeconds < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid delaySeconds",
        });
      }

      updateData.delaySeconds = delaySeconds;
    }

    if (hourlyLimit !== undefined) {
      if (
        typeof hourlyLimit !== "number" ||
        hourlyLimit <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid hourlyLimit",
        });
      }

      updateData.hourlyLimit = hourlyLimit;
    }

    const updatedCampaign =
      await updateCampaignService(
        id,
        updateData
      );

    return res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      campaign: updatedCampaign,
    });
  } catch (error: any) {
    if (error.message === "CAMPAIGN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    console.error("Update campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update campaign",
    });
  }
};

// =====================================================
// UPDATE CAMPAIGN STATUS
// PATCH /api/campaigns/:id/status
// =====================================================
export const updateCampaignStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    const campaign =
      await getCampaignByIdService(id);

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this campaign",
      });
    }

    const { status } = req.body;

    const validStatuses = [
      "SCHEDULED",
      "COMPLETED",
      "FAILED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be SCHEDULED, COMPLETED or FAILED",
      });
    }

    const updatedCampaign =
      await updateCampaignStatusService(
        id,
        status
      );

    return res.status(200).json({
      success: true,
      message:
        "Campaign status updated successfully",
      campaign: updatedCampaign,
    });
  } catch (error: any) {
    if (error.message === "CAMPAIGN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    console.error(
      "Update campaign status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update campaign status",
    });
  }
};

// =====================================================
// DELETE CAMPAIGN
// DELETE /api/campaigns/:id
// =====================================================
export const deleteCampaign = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    const campaign =
      await getCampaignByIdService(id);

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this campaign",
      });
    }

    await deleteCampaignService(id);

    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "CAMPAIGN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (error.message === "CAMPAIGN_HAS_EMAILS") {
      return res.status(409).json({
        success: false,
        message:
          "Campaign cannot be deleted because scheduled emails exist",
      });
    }

    console.error(
      "Delete campaign error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete campaign",
    });
  }
};
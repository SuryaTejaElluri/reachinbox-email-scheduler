import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";

import {
  createEmailService,
  getEmailByIdService,
  getEmailsByCampaignService,
  updateEmailService,
  deleteEmailService,
} from "../services/email.service";

import {
  getCampaignByIdService,
} from "../services/campaign.service";

// =====================================================
// CREATE EMAIL
// POST /api/emails/campaign/:campaignId
// =====================================================

export const createEmail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const campaignId = req.params.campaignId;

    if (
      typeof campaignId !== "string" ||
      campaignId.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    const campaign =
      await getCampaignByIdService(campaignId);

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this campaign",
      });
    }

    const {
      to,
      subject,
      body,
    } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message:
          "to, subject and body are required",
      });
    }

    const email = await createEmailService({
      campaignId,
      to,
      subject,
      body,
    });

    return res.status(201).json({
      success: true,
      message: "Email added to campaign successfully",
      email,
    });
  } catch (error: any) {
    console.error("Create email error:", error);

    if (error.message === "CAMPAIGN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create email",
    });
  }
};

// =====================================================
// GET EMAIL BY ID
// GET /api/emails/:id
// =====================================================

export const getEmailById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (
      typeof id !== "string" ||
      id.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email ID",
      });
    }

    const email = await getEmailByIdService(id);

    const campaign =
      await getCampaignByIdService(
        email.campaignId
      );

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this email",
      });
    }

    return res.status(200).json({
      success: true,
      email,
    });
  } catch (error: any) {
    console.error("Get email error:", error);

    if (error.message === "EMAIL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    if (error.message === "CAMPAIGN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get email",
    });
  }
};

// =====================================================
// GET CAMPAIGN EMAILS
// GET /api/emails/campaign/:campaignId
// =====================================================

export const getCampaignEmails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const campaignId = req.params.campaignId;

    if (
      typeof campaignId !== "string" ||
      campaignId.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID",
      });
    }

    const campaign =
      await getCampaignByIdService(campaignId);

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this campaign",
      });
    }

    const emails =
      await getEmailsByCampaignService(
        campaignId
      );

    return res.status(200).json({
      success: true,
      count: emails.length,
      emails,
    });
  } catch (error: any) {
    console.error(
      "Get campaign emails error:",
      error
    );

    if (error.message === "CAMPAIGN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get campaign emails",
    });
  }
};

// =====================================================
// UPDATE EMAIL
// PATCH /api/emails/:id
// =====================================================

export const updateEmail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (
      typeof id !== "string" ||
      id.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email ID",
      });
    }

    const email = await getEmailByIdService(id);

    const campaign =
      await getCampaignByIdService(
        email.campaignId
      );

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this email",
      });
    }

    const {
      to,
      subject,
      body,
    } = req.body;

    if (
      to === undefined &&
      subject === undefined &&
      body === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const updateData: {
      to?: string;
      subject?: string;
      body?: string;
    } = {};

    if (to !== undefined) {
      updateData.to = to;
    }

    if (subject !== undefined) {
      updateData.subject = subject;
    }

    if (body !== undefined) {
      updateData.body = body;
    }

    const updatedEmail =
      await updateEmailService(
        id,
        updateData
      );

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      email: updatedEmail,
    });
  } catch (error: any) {
    console.error("Update email error:", error);

    if (error.message === "EMAIL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    if (
      error.message ===
      "EMAIL_CANNOT_BE_UPDATED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Email cannot be updated after sending has started",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update email",
    });
  }
};

// =====================================================
// DELETE EMAIL
// DELETE /api/emails/:id
// =====================================================

export const deleteEmail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (
      typeof id !== "string" ||
      id.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email ID",
      });
    }

    const email = await getEmailByIdService(id);

    const campaign =
      await getCampaignByIdService(
        email.campaignId
      );

    if (campaign.userId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this email",
      });
    }

    await deleteEmailService(id);

    return res.status(200).json({
      success: true,
      message: "Email deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete email error:", error);

    if (error.message === "EMAIL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    if (error.message === "EMAIL_BEING_SENT") {
      return res.status(409).json({
        success: false,
        message: "Email is currently being sent",
      });
    }

    if (
      error.message ===
      "EMAIL_ALREADY_SENT"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Sent emails cannot be deleted",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete email",
    });
  }
};

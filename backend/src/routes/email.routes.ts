import { Router } from "express";

import {
  createEmail,
  getEmailById,
  getCampaignEmails,
  updateEmail,
  deleteEmail,
} from "../controllers/email.controller";

import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

// Create email for campaign
router.post(
  "/campaign/:campaignId",
  authenticateJWT,
  createEmail
);

// Get all emails of campaign
router.get(
  "/campaign/:campaignId",
  authenticateJWT,
  getCampaignEmails
);

// Get email by ID
router.get(
  "/:id",
  authenticateJWT,
  getEmailById
);

// Update email
router.patch(
  "/:id",
  authenticateJWT,
  updateEmail
);

// Delete email
router.delete(
  "/:id",
  authenticateJWT,
  deleteEmail
);

export default router;

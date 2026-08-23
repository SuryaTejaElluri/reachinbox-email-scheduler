import { Router } from "express";

import {
  getScheduledEmails,
  getSentEmails,
  getFailedEmails,
  getScheduledEmailById,
  getEmailStats,
  scheduleCampaignEmails,
} from "../controllers/scheduledEmail.controller";

const router = Router();

/**
 * Dashboard statistics
 *
 * GET /api/emails/stats
 */
router.get(
  "/stats",
  getEmailStats
);

/**
 * Scheduled emails
 *
 * GET /api/emails/scheduled
 */
router.get(
  "/scheduled",
  getScheduledEmails
);

/**
 * Sent emails
 *
 * GET /api/emails/sent
 */
router.get(
  "/sent",
  getSentEmails
);

/**
 * Failed emails
 *
 * GET /api/emails/failed
 */
router.get(
  "/failed",
  getFailedEmails
);

router.post(
  "/campaign",
  scheduleCampaignEmails
);

/**
 * Single email
 *
 * GET /api/emails/:id
 */
router.get(
  "/:id",
  getScheduledEmailById
);

export default router;
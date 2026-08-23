import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getCampaignsByUser,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
} from "../controllers/campaign.controller";

const router = Router();

// Create campaign
router.post("/",authenticateJWT,  createCampaign);

// Get all campaigns
router.get("/",authenticateJWT,  getAllCampaigns);

// Get campaigns belonging to a user
router.get("/user/:userId",authenticateJWT,  getCampaignsByUser);

// Get campaign by ID
router.get("/:id", authenticateJWT, getCampaignById);

// Update campaign
router.patch("/:id", authenticateJWT, updateCampaign);

// Update campaign status
router.patch("/:id/status", authenticateJWT, updateCampaignStatus);

// Delete campaign
router.delete("/:id", authenticateJWT, deleteCampaign);

export default router;
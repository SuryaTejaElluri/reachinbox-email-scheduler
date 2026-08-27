import api from "./api";
import type { Campaign, CreateCampaignPayload, ScheduledEmail, User } from "../types";

export const campaignService = {
  // Demo Login / Auth
  demoLogin: async (email?: string, name?: string): Promise<{ token: string; user: User }> => {
    const res = await api.post("/api/auth/demo", { email, name });
    if (res.data.token) {
      localStorage.setItem("reachinbox_token", res.data.token);
    }
    return res.data;
  },

  // Get all campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    const res = await api.get("/api/campaigns");
    return res.data.campaigns || [];
  },

  // Get campaign by ID (includes emails)
  getCampaign: async (id: string): Promise<Campaign> => {
    const res = await api.get(`/api/campaigns/${id}`);
    return res.data.campaign;
  },

  // Create campaign with recipients
  createCampaign: async (payload: CreateCampaignPayload): Promise<Campaign> => {
    const res = await api.post("/api/campaigns", payload);
    return res.data.campaign;
  },

  // Update campaign
  updateCampaign: async (
    id: string,
    data: Partial<Omit<CreateCampaignPayload, "recipients">>
  ): Promise<Campaign> => {
    const res = await api.patch(`/api/campaigns/${id}`, data);
    return res.data.campaign;
  },

  // Update campaign status
  updateCampaignStatus: async (
    id: string,
    status: "SCHEDULED" | "COMPLETED" | "FAILED"
  ): Promise<Campaign> => {
    const res = await api.patch(`/api/campaigns/${id}/status`, { status });
    return res.data.campaign;
  },

  // Delete campaign
  deleteCampaign: async (id: string): Promise<void> => {
    await api.delete(`/api/campaigns/${id}`);
  },

  // Get emails for a campaign
  getCampaignEmails: async (campaignId: string): Promise<ScheduledEmail[]> => {
    const res = await api.get(`/api/emails/campaign/${campaignId}`);
    return res.data.emails || [];
  },

  // Get email by ID
  getEmailById: async (id: string): Promise<ScheduledEmail> => {
    const res = await api.get(`/api/emails/${id}`);
    return res.data.email;
  },

  // Delete email
  deleteEmail: async (id: string): Promise<void> => {
    await api.delete(`/api/emails/${id}`);
  },
};

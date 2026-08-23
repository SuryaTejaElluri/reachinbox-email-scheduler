export type CampaignStatus = "SCHEDULED" | "COMPLETED" | "FAILED";

export type EmailStatus = "PENDING" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";

export interface ScheduledEmail {
  id: string;
  campaignId: string;
  to: string;
  subject: string;
  body: string;
  status: EmailStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  failedAt: string | null;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
  subject: string;
  body: string;
  startTime: string;
  delaySeconds: number;
  hourlyLimit: number;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  emails?: ScheduledEmail[];
  _count?: {
    emails: number;
  };
}

export interface CreateCampaignPayload {
  subject: string;
  body: string;
  startTime: string;
  delaySeconds: number;
  hourlyLimit: number;
  recipients: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

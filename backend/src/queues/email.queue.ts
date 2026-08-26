import { Queue } from "bullmq";
import { bullRedisConnection } from "../config/bullmq";

export interface EmailJobData {
  scheduledEmailId: string;
  recipient: string;
  subject: string;
  body: string;
  campaignId: string;
  userId: string;
}

export const emailQueue = new Queue<EmailJobData>("email-queue", {
  connection: bullRedisConnection,
});
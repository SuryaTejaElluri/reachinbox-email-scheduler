import cron from "node-cron";
import { prisma } from "../config/prisma";
import { EmailStatus } from "../generated/prisma/enums";
import { sendMailService } from "../services/mailSender.service";

let isRunning = false;

export const processScheduledEmails = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  console.log(`[Scheduler Tick] Checking scheduled emails at server time: ${now.toISOString()} (${now.toLocaleString()})`);

  try {
    // 1. Query pending / scheduled emails due on or before now
    const emails = await prisma.scheduledEmail.findMany({
      where: {
        status: {
          in: [EmailStatus.PENDING, EmailStatus.SCHEDULED],
        },
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        campaign: true,
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 50,
    });

    console.log(`[Scheduler] Found ${emails.length} due email(s) scheduled on or before ${now.toISOString()}`);

    if (emails.length === 0) {
      return;
    }

    for (const email of emails) {
      console.log(
        `[Scheduler] Selected email ID: ${email.id} | To: ${email.to} | Campaign: "${email.campaign.subject}" | ScheduledAt: ${email.scheduledAt ? new Date(email.scheduledAt).toISOString() : "null"}`
      );

      try {
        const campaign = email.campaign;

        // 2. Check hourly limit for campaign
        const sentCount = await prisma.scheduledEmail.count({
          where: {
            campaignId: campaign.id,
            status: EmailStatus.SENT,
            sentAt: {
              gte: oneHourAgo,
            },
          },
        });

        if (sentCount >= campaign.hourlyLimit) {
          console.warn(
            `[Scheduler] Campaign ${campaign.id} reached hourly limit (${sentCount}/${campaign.hourlyLimit}). Skipping email ${email.id} for now.`
          );
          continue;
        }

        // 3. Atomically change status to SENDING
        const updated = await prisma.scheduledEmail.updateMany({
          where: {
            id: email.id,
            status: {
              in: [EmailStatus.PENDING, EmailStatus.SCHEDULED],
            },
          },
          data: {
            status: EmailStatus.SENDING,
          },
        });

        if (updated.count === 0) {
          console.warn(`[Scheduler] Email ${email.id} was claimed by another worker. Skipping.`);
          continue;
        }

        console.log(`[Scheduler] Updated email ${email.id} status -> SENDING`);

        // 4. Send email via mail service
        console.log(`[Scheduler] Calling sendMailService for ${email.to}...`);
        await sendMailService({
          to: email.to,
          subject: email.subject,
          body: email.body,
        });

        // 5. Success -> SENT
        await prisma.scheduledEmail.update({
          where: {
            id: email.id,
          },
          data: {
            status: EmailStatus.SENT,
            sentAt: new Date(),
            failedAt: null,
            error: null,
          },
        });

        console.log(`[Scheduler] ✅ Updated email ${email.id} status -> SENT`);
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Scheduler] ❌ Failed to send email ${email.id}:`, errorMessage);

        const nextRetryCount = email.retryCount + 1;

        if (nextRetryCount <= email.maxRetries) {
          const delaySeconds = Math.pow(2, nextRetryCount - 1) * 30;
          const nextScheduledAt = new Date(Date.now() + delaySeconds * 1000);

          await prisma.scheduledEmail.update({
            where: {
              id: email.id,
            },
            data: {
              status: EmailStatus.SCHEDULED,
              retryCount: nextRetryCount,
              scheduledAt: nextScheduledAt,
              error: errorMessage,
            },
          });

          console.log(`[Scheduler] Rescheduled email ${email.id} for retry ${nextRetryCount}/${email.maxRetries} at ${nextScheduledAt.toISOString()}`);
        } else {
          await prisma.scheduledEmail.update({
            where: {
              id: email.id,
            },
            data: {
              status: EmailStatus.FAILED,
              failedAt: new Date(),
              error: errorMessage,
            },
          });

          console.error(`[Scheduler] ❌ Max retries reached. Updated email ${email.id} status -> FAILED`);
        }
      } finally {
        // 6. Check campaign completion
        const remaining = await prisma.scheduledEmail.count({
          where: {
            campaignId: email.campaignId,
            status: {
              in: [EmailStatus.PENDING, EmailStatus.SCHEDULED, EmailStatus.SENDING],
            },
          },
        });

        if (remaining === 0) {
          const failedCount = await prisma.scheduledEmail.count({
            where: {
              campaignId: email.campaignId,
              status: EmailStatus.FAILED,
            },
          });

          const finalStatus = failedCount > 0 ? "FAILED" : "COMPLETED";

          await prisma.campaign.update({
            where: {
              id: email.campaignId,
            },
            data: {
              status: finalStatus,
            },
          });

          console.log(`[Scheduler] Campaign ${email.campaignId} finished. Updated status -> ${finalStatus}`);
        }
      }
    }
  } catch (error) {
    console.error("[Scheduler] Execution error:", error);
  }
};

export const startEmailScheduler = () => {
  console.log("📧 Email scheduler started");

  const runScheduler = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await processScheduledEmails();
    } catch (err) {
      console.error("[Scheduler] Unhandled error in runScheduler:", err);
    } finally {
      isRunning = false;
    }
  };

  // Immediate check on startup
  runScheduler();

  // Run every 10 seconds via node-cron (using 6-field pattern) or setInterval
  try {
    cron.schedule("*/10 * * * * *", runScheduler);
  } catch (_e) {
    setInterval(runScheduler, 10000);
  }
};

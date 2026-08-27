import "dotenv/config";
import { prisma } from "../config/prisma";
import { emailQueue } from "../queues/email.queue";

/**
 * Startup recovery: re-enqueue any PENDING/SCHEDULED emails
 * from the database into BullMQ so they will be sent at the
 * correct time even after a server restart.
 *
 * This replaces the old node-cron poller and satisfies the
 * assignment's "no cron" constraint.
 */
export async function recoverPendingEmails(): Promise<void> {
  console.log("[Recovery] Scanning DB for un-queued PENDING/SCHEDULED emails…");

  const emails = await prisma.scheduledEmail.findMany({
    where: {
      status: {
        in: ["PENDING", "SCHEDULED"],
      },
      scheduledAt: {
        not: null,
      },
    },
    include: {
      campaign: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  if (emails.length === 0) {
    console.log("[Recovery] No pending emails found. Nothing to recover.");
    return;
  }

  console.log(`[Recovery] Found ${emails.length} email(s) to recover.`);

  let enqueued = 0;
  let skipped = 0;

  for (const email of emails) {
    const jobId = `email-${email.id}`;

    // Check if a BullMQ job already exists for this email
    const existingJob = await emailQueue.getJob(jobId);

    if (existingJob) {
      const state = await existingJob.getState();
      if (state !== "completed" && state !== "failed") {
        // Job still exists and is active/waiting/delayed — skip
        skipped++;
        continue;
      }
    }

    // Ensure the email is in SCHEDULED state for the worker
    if (email.status === "PENDING") {
      await prisma.scheduledEmail.update({
        where: { id: email.id },
        data: { status: "SCHEDULED" },
      });
    }

    const delay = Math.max(
      0,
      (email.scheduledAt?.getTime() ?? Date.now()) - Date.now()
    );

    await emailQueue.add(
      "send-email",
      {
        scheduledEmailId: email.id,
        recipient: email.to,
        subject: email.subject,
        body: email.body,
        campaignId: email.campaignId,
        userId: email.campaign.userId,
      },
      {
        delay,
        jobId,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 30_000,
        },
      }
    );

    enqueued++;
  }

  console.log(
    `[Recovery] Done. Enqueued: ${enqueued}, Skipped (already queued): ${skipped}`
  );
}

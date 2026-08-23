import { Worker, Job } from "bullmq";

import { bullRedisConnection } from "../config/bullmq";
import { prisma } from "../config/prisma";
import { sendEmailService } from "../services/mail.service";
import { checkHourlyRateLimit } from "../utils/rateLimiter";

import {
  EmailJobData,
} from "../queues/email.queue";

const workerConcurrency = Number(
  process.env.WORKER_CONCURRENCY || 5
);

const minDelay = Number(
  process.env.MIN_EMAIL_DELAY_MS || 2000
);

let lastEmailSentAt = 0;

const waitForMinimumDelay = async () => {
  const now = Date.now();

  const elapsed = now - lastEmailSentAt;

  if (elapsed < minDelay) {
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        minDelay - elapsed
      )
    );
  }

  lastEmailSentAt = Date.now();
};

const processEmail = async (
  job: Job<EmailJobData>
) => {
  const {
    scheduledEmailId,
    recipient,
    subject,
    body,
  } = job.data;

  const email =
    await prisma.scheduledEmail.findUnique({
      where: {
        id: scheduledEmailId,
      },
    });

  if (!email) {
    throw new Error(
      "Scheduled email does not exist"
    );
  }

  /*
   * Idempotency protection.
   *
   * If the email has already been sent,
   * don't send it again.
   */
  if (email.status === "SENT") {
    console.log(
      `Skipping already sent email ${scheduledEmailId}`
    );

    return;
  }

  /*
   * Atomic status transition.
   *
   * Only one worker should be able to
   * change SCHEDULED → PROCESSING.
   */
  const claimed =
    await prisma.scheduledEmail.updateMany({
      where: {
        id: scheduledEmailId,
        status: "SCHEDULED",
      },

      data: {
        status: "SENDING",
      },
    });

  if (claimed.count === 0) {
    const latest =
      await prisma.scheduledEmail.findUnique({
        where: {
          id: scheduledEmailId,
        },
      });

    if (latest?.status === "SENT") {
      return;
    }

    if (latest?.status === "SENDING") {
      return;
    }

    throw new Error(
      "Unable to claim email job"
    );
  }

  /*
   * Redis-backed hourly limit.
   */
  const rateLimit =
    await checkHourlyRateLimit(
      "global"
    );

  if (!rateLimit.allowed) {
    /*
     * Put email back into SCHEDULED state.
     */
    await prisma.scheduledEmail.update({
      where: {
        id: scheduledEmailId,
      },

      data: {
        status: "SCHEDULED",
      },
    });

    /*
     * Throwing an error would consume a retry.
     * Instead, reschedule the current BullMQ job.
     */
    throw new Error(
      `HOURLY_RATE_LIMIT:${rateLimit.retryAt?.getTime()}`
    );
  }

  await waitForMinimumDelay();

  try {
    const info = await sendEmailService({
      to: recipient,
      subject,
      body,
    });

    await prisma.scheduledEmail.update({
      where: {
        id: scheduledEmailId,
      },

      data: {
        status: "SENT",
        sentAt: new Date(),
        error: null,
      },
    });

    const remainingEmails =
      await prisma.scheduledEmail.count({
        where: {
          campaignId: email.campaignId,
          status: {
            in: ["PENDING", "SCHEDULED", "SENDING"],
          },
        },
      });

    if (remainingEmails === 0) {
      await prisma.campaign.update({
        where: {
          id: email.campaignId,
        },
        data: {
          status: "COMPLETED",
        },
      });

      console.log(
        `Campaign completed: ${email.campaignId}`
      );
    }

    console.log(
      `Email sent to ${recipient}`,
      info.messageId
    );
  } catch (error) {
    await prisma.scheduledEmail.update({
      where: {
        id: scheduledEmailId,
      },

      data: {
        status: "FAILED",
        failedAt: new Date(),
        error:
          error instanceof Error
            ? error.message
            : "Unknown email error",
      },
    });

    throw error;
  }
};

export const emailWorker = new Worker<EmailJobData>(
  "email-queue",
  processEmail,
  {
    connection: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT || 6379),
    },

    concurrency: workerConcurrency,
  }
);

emailWorker.on(
  "completed",
  (job) => {
    console.log(
      `Email job completed: ${job.id}`
    );
  }
);

emailWorker.on(
  "failed",
  async (job, error) => {
    console.error(
      `Email job failed: ${job?.id}`,
      error.message
    );

    /*
     * Rate-limit jobs need special handling.
     */
    if (
      error.message.startsWith(
        "HOURLY_RATE_LIMIT:"
      ) &&
      job
    ) {
      const timestamp = Number(
        error.message.split(":")[1]
      );

      const delay = Math.max(
        1000,
        timestamp - Date.now()
      );

      await job.moveToDelayed(
        Date.now() + delay,
        job.token
      );

      console.log(
        `Job ${job.id} delayed until next hour`
      );
    }
  }
);

emailWorker.on(
  "error",
  (error) => {
    console.error(
      "Email worker error:",
      error
    );
  }
);

console.log(
  `Email worker started with concurrency ${workerConcurrency}`
);
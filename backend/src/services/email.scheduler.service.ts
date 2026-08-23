import { processScheduledEmails } from "../jobs/email.scheduler";

export const processDueEmailsService = async () => {
  return processScheduledEmails();
};

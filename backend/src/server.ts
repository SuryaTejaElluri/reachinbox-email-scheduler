import "dotenv/config";
import app from "./app";
import { recoverPendingEmails } from "./jobs/emailScheduler";
import "./workers/email.worker";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Recover any pending emails from DB into BullMQ on startup
  try {
    await recoverPendingEmails();
  } catch (err) {
    console.error("[Startup] Failed to recover pending emails:", err);
  }
});
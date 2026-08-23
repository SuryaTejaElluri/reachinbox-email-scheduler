import "dotenv/config";
import app from "./app";
import { startEmailScheduler } from "./jobs/emailScheduler";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  startEmailScheduler();
});
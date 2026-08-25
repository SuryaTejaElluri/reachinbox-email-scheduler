import express from "express";
import cors from "cors";

import { prisma } from "./config/prisma";

import userRoutes from "./routes/user.routes";
import campaignRoutes from "./routes/campaign.routes";
import emailRoutes from "./routes/email.routes";
import scheduledEmailRoutes from "./routes/scheduledEmail.routes";
import csvRoutes from "./routes/csv.routes";
import authRoutes from "./routes/auth.routes";

import passport from "./config/passport";
import { authenticateJWT } from "./middleware/auth.middleware";

const app = express();

/*
 * Global middleware
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

/*
 * Passport
 */
app.use(passport.initialize());

/*
 * Health check
 */
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "ReachInbox Scheduler API is running",
  });
});

/*
 * Database health check
 */
app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Database connection is working",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

/*
 * Public routes
 *
 * Google authentication remains public because
 * users need to login before receiving a JWT.
 */
app.use("/api/auth", authRoutes);

/*
 * User routes
 */
app.use("/api/users", userRoutes);

/*
 * Protected routes
 *
 * These require:
 *
 * Authorization: Bearer <JWT>
 */
app.use(
  "/api/campaigns",
  authenticateJWT,
  campaignRoutes
);

app.use("/api/emails", emailRoutes);

app.use(
  "/api/scheduled-emails",
  authenticateJWT,
  scheduledEmailRoutes
);

app.use(
  "/api/csv",
  authenticateJWT,
  csvRoutes
);



export default app;
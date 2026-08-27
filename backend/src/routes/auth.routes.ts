import { Router } from "express";
import passport from "../config/passport";
import { generateToken } from "../utils/jwt";
import { prisma } from "../config/prisma";

const router = Router();

/**
 * Start Google OAuth
 * GET /api/auth/google
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failure",
  }),
  (req, res) => {
    const user = req.user as {
      id: string;
      email: string;
      name: string;
      googleId: string | null;
      avatarUrl: string | null;
    };

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Redirect to frontend with token (browser-based OAuth flow)
    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
      const callbackUrl = new URL("/auth/callback", frontendUrl);
      callbackUrl.searchParams.set("token", token);
      callbackUrl.searchParams.set("userId", user.id);
      return res.redirect(callbackUrl.toString());
    }

    // Fallback: return JSON if FRONTEND_URL is not configured
    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      token,
      user,
    });
  }
);

/**
 * Google authentication failure
 */
router.get("/google/failure", (_req, res) => {
  return res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

/**
 * Demo / direct authentication
 * POST /api/auth/demo
 */
router.post("/demo", async (req, res) => {
  try {
    const email = req.body?.email || "demo@reachinbox.com";
    const name = req.body?.name || "Demo User";

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error: any) {
    console.error("Demo auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Demo authentication failed",
    });
  }
});

export default router;
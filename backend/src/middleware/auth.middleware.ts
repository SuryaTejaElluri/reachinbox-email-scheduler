import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authorization header is required",
      });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
      return;
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      res.status(401).json({
        success: false,
        message: "JWT token is required",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured");

      res.status(500).json({
        success: false,
        message: "JWT configuration error",
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.userId || !decoded.email) {
      res.status(401).json({
        success: false,
        message: "Invalid JWT payload",
      });
      return;
    }

    /*
     * Store authenticated user information
     * temporarily on the request object.
     */
    (
      req as Request & {
        authUser?: {
          userId: string;
          email: string;
        };
        userId?: string;
      }
    ).authUser = {
      userId: decoded.userId,
      email: decoded.email,
    };
    (req as any).userId = decoded.userId;

    next();
  } catch (error) {
    console.error("JWT authentication error:", error);

    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
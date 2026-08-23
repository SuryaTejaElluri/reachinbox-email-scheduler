import { Request } from "express";
import { User } from "../generated/prisma/models";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: User;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: User;
}
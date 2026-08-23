import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateToken = (
  payload: JwtPayload
): string => {
  const expiresIn =
    process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: expiresIn as any,
    }
  );
};

export const verifyToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    JWT_SECRET
  ) as JwtPayload;
};
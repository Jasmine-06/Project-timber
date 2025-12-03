import jwt from "jsonwebtoken";
import type { IUser } from "../models/user.models";
import logger from "./logger";

export const generateAccessToken = (user: Partial<IUser>): string => {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || "default_secret";
    const expiresIn = "10m";
    return jwt.sign({ user }, secret, { expiresIn });
  } catch (error) {
    logger.error(error, "JWT generation error");
    throw new Error("JWT generation failed !");
  }
};

export const generateRefreshToken = (user: Partial<IUser>): string => {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET!;
    const expiresIn = "30d";
    return jwt.sign({ user }, secret, { expiresIn });
  } catch (error) {
    logger.error(error, "JWT generation error");
    throw new Error("JWT generation failed !");
  }
};

type JwtPayloadWithUser = {
  user: Partial<IUser>;
  iat?: number;
  exp?: number;
};

export const verifyAccessToken = (token: string): Partial<IUser> | null => {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET!;
    const decodeJwt = jwt.verify(token, secret) as JwtPayloadWithUser;
    logger.info({ user: decodeJwt.user }, "decoded user");
    return decodeJwt.user || null;
  } catch (error) {
    logger.error(error, "Invalid access token");
    return null;
  }
};
export const verifyRefreshToken = (token: string): Partial<IUser> | null => {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET!;
    const decodeJwt = jwt.verify(token, secret) as JwtPayloadWithUser;
    return decodeJwt.user || null;
  } catch (error) {
    logger.error(error, "Invalid refresh token");
    return null;
  }
};

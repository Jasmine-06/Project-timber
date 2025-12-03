import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../advices/ApiResponse";
import { ApiError } from "../advices/ApiError";
import { verifyAccessToken } from "../utils/jwt.utils";
import logger from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

//
export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies.accessToken;
    let token: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }
    if (!token) {
      res
        .status(401)
        .json(
          new ApiResponse(
            null,
            new ApiError(401, "access token not found in header or cookies")
          )
        );
      return;
    }

    // verify the token
    const user = verifyAccessToken(token);
    if (!user) {
      res
        .status(401)
        .json(
          new ApiResponse(
            null,
            new ApiError(401, "Invalid or expired Access Token")
          )
        );
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(error, "AuthMiddleware error");
    res
      .status(500)
      .json(
        new ApiResponse(
          null,
          new ApiError(500, "Internal server error during authentication")
        )
      );
  }
};

import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/user.models";
import { ApiError } from "../advices/ApiError";
import logger from "../utils/logger";

export const checkRole = (allowedUser: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = (req.user?.roles || []) as UserRole[];

    // If there are no roles on the user, treat as unauthenticated
    if (userRoles.length === 0) {
      return next(new ApiError(401, "unauthenticated user"));
    }

    const isAllowedRole = userRoles.some((role) => allowedUser.includes(role));

    if (!isAllowedRole) {
      return next(new ApiError(403, "Access denied"));
    }

    next();
  };
};

export const isAdmin = checkRole([UserRole.ADMIN]);

import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/user.models";
import { ApiError } from "../advices/ApiError";

export const checkRole = (allowedUser: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRoles = (req.user?.roles || []) as UserRole[];
        console.log(userRoles);

         if(userRoles.length == 0) {
            throw new ApiError(401, "unauthenticated user")
         }

        const isAllowedRole = userRoles.some((role) => allowedUser.includes(role));

        if(!isAllowedRole) {
            throw new ApiError(403, "Access denied")
        }
       
        next();

    }
}

export const isAdmin = checkRole([UserRole.ADMIN]);
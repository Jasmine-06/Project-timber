import type {Request, Response, NextFunction} from "express";
import { ApiError } from "../advices/ApiError";
import { ApiResponse } from "../advices/ApiResponse";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if(err instanceof ApiError) {
        res.status(err.status_code).json(new ApiResponse(null, new ApiError(err.status_code, err.message, err.errors)));
    } else if (err.name === "MongoServerError" && err.code === 11000) {
        // Handle MongoDB duplicate key error
        const field = Object.keys(err.keyValue || {})[0];
        const message = field 
            ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            : "Duplicate entry found";
        console.error("MongoDB Duplicate Key Error:", err);
        res.status(400).json(new ApiResponse(null, new ApiError(400, message)));
    } else if (err.name === "ValidationError") {
        // Handle Mongoose validation errors
        console.error("Validation Error:", err);
        res.status(400).json(new ApiResponse(null, new ApiError(400, "Validation failed", err.errors)));
    } else if (err.name === "CastError") {
        // Handle invalid MongoDB ObjectId
        console.error("Cast Error:", err);
        res.status(400).json(new ApiResponse(null, new ApiError(400, "Invalid ID format")));
    } else {
        console.error("Unhandled Error:", err);
        res.status(500).json(new ApiResponse(null, new ApiError(500, "Internal Server Error")));
    }
}
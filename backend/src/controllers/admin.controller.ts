import { ApiError } from "../advices/ApiError"
import { ApiResponse } from "../advices/ApiResponse"
import { GetUserQuerySchema } from "../schema/admin.schema"
import { AdminService } from "../services/admin.service"
import asyncHandler from "../utils/asyncHandler"
import { zodErrorFormatter } from "../utils/error.formatter"

const GetAllUserController = asyncHandler(async (req, res) => {
    const result = GetUserQuerySchema.safeParse(req.query);
    
    if (!result.success) {
        throw new ApiError(400, "Validation Error", zodErrorFormatter(result.error));
    }

    const paginationParams = result.data;
    const data = await AdminService.getAllUser(paginationParams);
    
    res.status(200).json(
        new ApiResponse({
            data: data.user,
            pagination: {
                totalUser: data.totalUser,
                totalPage: data.totalPage,
                currentPage: data.currentPage,
                limit: paginationParams.limit,
            },
            message: "User list retrieved successfully"
        })
    );
});

const SuspendedUserController = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    
    if (!req.user?._id) {
        throw new ApiError(401, "Authentication failed: Admin ID not found");
    }
    
    const updatedUser = await AdminService.suspendUser(userId);
    
    res.status(200).json(
        new ApiResponse({
            data: updatedUser,
            message: "User suspended successfully"
        })
    );
});

const ReactiveUserController = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    
    if (!req.user?._id) {
        throw new ApiError(401, "Authentication failed: Admin ID not found");
    }
    
    const updatedUser = await AdminService.reactiveUser(userId);
    
    res.status(200).json(
        new ApiResponse({
            data: updatedUser,
            message: "User reactivated successfully"
        })
    );
});


export {
    GetAllUserController,
    SuspendedUserController,
    ReactiveUserController
}
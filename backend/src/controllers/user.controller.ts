import { ApiError } from "../advices/ApiError";
import { ApiResponse } from "../advices/ApiResponse";
import { UserRepository } from "../repositories/user.repository";
import asyncHandler from "../utils/asyncHandler";

export const meController = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new ApiError(401, "User not authorized");
    }

    const { _id } = req.user;

    const user = await UserRepository.findUserById(_id, { password: 0 });

    if(!user){
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(user));
})
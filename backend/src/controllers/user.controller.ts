import { ApiError } from "../advices/ApiError";
import { ApiResponse } from "../advices/ApiResponse";
import { UserRepository } from "../repositories/user.repository";
import { GetUserQuerySchema } from "../schema/user.schema";
import { UserService } from "../services/user.service";
import asyncHandler from "../utils/asyncHandler";
import { zodErrorFormatter } from "../utils/error.formatter";
import { USER_PROJECTION } from "../repositories/user.repository";
import logger from "../utils/logger";

const meController = asyncHandler(async (req, res) => {
  logger.debug("meController request");
  if (!req.user) {
    throw new ApiError(401, "User not authorized");
  }
  const { _id } = req.user;
  const user = await UserRepository.findUserById(_id, USER_PROJECTION);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(user));
});

const GetAllUserController = asyncHandler(async (req, res) => {
  logger.debug({ query: req.query }, "GetAllUserController request");
  const result = GetUserQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }
  const paginationParams = result.data;
  const data = await UserService.getAllUser(paginationParams);
  res.status(200).json(
    new ApiResponse({
      data: data.user,
      pagination: {
        totalUser: data.totalUser,
        totalPage: data.totalPage,
        currentPage: data.currentPage,
        limit: paginationParams.limit,
      },
      message: "User list retrieved successfully",
    })
  );
});

const SuspendedUserController = asyncHandler(async (req, res) => {
  logger.debug({ params: req.params }, "SuspendedUserController request");
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Authentication failed: Admin ID not found");
  }

  const updatedUser = await UserService.suspendUser(userId);
  logger.info({ userId }, "User suspended successfully");

  res.status(200).json(
    new ApiResponse({
      data: updatedUser,
      message: "User suspended successfully",
    })
  );
});

const ReactiveUserController = asyncHandler(async (req, res) => {
  logger.debug({ params: req.params }, "ReactiveUserController request");
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Authentication failed: Admin ID not found");
  }

  const updatedUser = await UserService.reactiveUser(userId);
  logger.info({ userId }, "User reactivated successfully");

  res.status(200).json(
    new ApiResponse({
      data: updatedUser,
      message: "User reactivated successfully",
    })
  );
});

const FollowUserController = asyncHandler(async (req, res) => {
  logger.debug({ params: req.params }, "FollowUserController request");
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID to follow is required");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Authentication failed");
  }

  const result = await UserService.followUser(req.user._id, userId);
  logger.info(
    { followerId: req.user._id, followingId: userId },
    "User followed successfully"
  );

  res.status(200).json(
    new ApiResponse({
      message: result.message,
    })
  );
});

const UnfollowUserController = asyncHandler(async (req, res) => {
  logger.debug({ params: req.params }, "UnfollowUserController request");
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID to unfollow is required");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Authentication failed");
  }

  const result = await UserService.unfollowUser(req.user._id, userId);
  logger.info(
    { followerId: req.user._id, followingId: userId },
    "User unfollowed successfully"
  );

  res.status(200).json(
    new ApiResponse({
      message: result.message,
    })
  );
});

const GetUserFollowersController = asyncHandler(async (req, res) => {
  logger.debug(
    { params: req.params, query: req.query },
    "GetUserFollowersController request"
  );
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const result = GetUserQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }
  const { page, limit } = result.data;

  const data = await UserService.getUserFollowers(userId, page, limit);

  res.status(200).json(
    new ApiResponse({
      data: data.followers,
      pagination: {
        totalFollowers: data.totalFollowers,
        totalPage: data.totalPage,
        currentPage: data.currentPage,
        limit: limit,
      },
      message: "User followers retrieved successfully",
    })
  );
});

const GetUserFollowingController = asyncHandler(async (req, res) => {
  logger.debug(
    { params: req.params, query: req.query },
    "GetUserFollowingController request"
  );
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const result = GetUserQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }
  const { page, limit } = result.data;

  const data = await UserService.getUserFollowing(userId, page, limit);

  res.status(200).json(
    new ApiResponse({
      data: data.following,
      pagination: {
        totalFollowing: data.totalFollowing,
        totalPage: data.totalPage,
        currentPage: data.currentPage,
        limit: limit,
      },
      message: "User following retrieved successfully",
    })
  );
});

export {
  meController,
  GetAllUserController,
  SuspendedUserController,
  ReactiveUserController,
  FollowUserController,
  UnfollowUserController,
  GetUserFollowersController,
  GetUserFollowingController,
};

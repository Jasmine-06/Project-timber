import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { CommunityService } from "../services/community.service";
import { ApiResponse } from "../advices/ApiResponse";
import { ApiError } from "../advices/ApiError";
import logger from "../utils/logger";
import { zodErrorFormatter } from "../utils/error.formatter";
import {
  AddAdminSchema,
  createCommunitySchema,
  GetCommunityQuerySchema,
  updateCommunitySchema,
} from "../schema/community.schema";

export const CreateCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "CreateCommunityController request");

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    const result = createCommunitySchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const community = await CommunityService.createCommunity({
      ...result.data,
      owner: req.user._id,
    });

    logger.info(
      { communityId: community._id },
      "Community created successfully"
    );

    res
      .status(201)
      .json(
        new ApiResponse({
          community,
          message: "Community created successfully",
        })
      );
  }
);

export const GetAllCommunitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ query: req.query }, "GetAllCommunitiesController request");

    const result = GetCommunityQuerySchema.safeParse(req.query);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const { page, limit, search } = result.data;
    const data = await CommunityService.getAllCommunities(page, limit, search);

    res
      .status(200)
      .json(
        new ApiResponse({
          ...data,
          message: "Communities retrieved successfully",
        })
      );
  }
);

export const GetCommunityByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "GetCommunityByIdController request");
    const { communityId } = req.params;

    if (!communityId) {
      throw new ApiError(400, "Community ID is required");
    }

    const community = await CommunityService.getCommunityById(communityId);

    res
      .status(200)
      .json(
        new ApiResponse({
          community,
          message: "Community retrieved successfully",
        })
      );
  }
);

export const UpdateCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug(
      { params: req.params, body: req.body },
      "UpdateCommunityController request"
    );
    const { communityId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!communityId) {
      throw new ApiError(400, "Community ID is required");
    }

    const result = updateCommunitySchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const updatedCommunity = await CommunityService.updateCommunity(
      communityId,
      req.user._id,
      result.data
    );

    logger.info({ communityId }, "Community updated successfully");

    res
      .status(200)
      .json(
        new ApiResponse({
          community: updatedCommunity,
          message: "Community updated successfully",
        })
      );
  }
);

export const JoinCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "JoinCommunityController request");
    const { communityId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!communityId) {
      throw new ApiError(400, "Community ID is required");
    }

    const result = await CommunityService.joinCommunity(
      communityId,
      req.user._id
    );

    logger.info(
      { communityId, userId: req.user._id },
      "Joined community successfully"
    );

    res.status(200).json(new ApiResponse(result));
  }
);

export const LeaveCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "LeaveCommunityController request");
    const { communityId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!communityId) {
      throw new ApiError(400, "Community ID is required");
    }

    const result = await CommunityService.leaveCommunity(
      communityId,
      req.user._id
    );

    logger.info(
      { communityId, userId: req.user._id },
      "Left community successfully"
    );

    res.status(200).json(new ApiResponse(result));
  }
);

export const DeleteCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "DeleteCommunityController request");
    const { communityId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!communityId) {
      throw new ApiError(400, "Community ID is required");
    }

    const result = await CommunityService.deleteCommunity(
      communityId,
      req.user._id
    );

    logger.info({ communityId }, "Community deleted successfully");

    res.status(200).json(new ApiResponse(result));
  }
);

export const AddAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug(
      { params: req.params, body: req.body },
      "AddAdminController request"
    );
    const { communityId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!communityId) {
      throw new ApiError(400, "Community ID is required");
    }

    const result = AddAdminSchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const response = await CommunityService.addAdmin(
      communityId,
      req.user._id,
      result.data.userId
    );

    logger.info(
      { communityId, targetUserId: result.data.userId },
      "Admin added successfully"
    );

    res.status(200).json(new ApiResponse(response));
  }
);

export const RemoveAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "RemoveAdminController request");
    const { communityId, userId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!communityId || !userId) {
      throw new ApiError(400, "Community ID and User ID are required");
    }

    const response = await CommunityService.removeAdmin(
      communityId,
      req.user._id,
      userId
    );

    logger.info(
      { communityId, targetUserId: userId },
      "Admin removed successfully"
    );

    res.status(200).json(new ApiResponse(response));
  }
);

export const GetUserCommunitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug(
      { user: req.user },
      "GetUserCommunitiesController request"
    );

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    const data = await CommunityService.getCommunitiesByUser(req.user._id);

    res
      .status(200)
      .json(
        new ApiResponse({
          ...data,
          message: "User communities retrieved successfully",
        })
      );
  }
);

export const GetCommunityMessagesController = asyncHandler(
    async (req: Request, res: Response) => {
        logger.debug({ params: req.params, query: req.query }, "GetCommunityMessagesController request");
        const { communityId } = req.params;
        const { limit, before } = req.query;

        if (!req.user?._id) {
            throw new ApiError(401, "Authentication failed");
        }

        if (!communityId) {
            throw new ApiError(400, "Community ID is required");
        }

        // Validate query params if needed, or cast them
        const limitNum = limit ? parseInt(limit as string) : 50;
        
        const messages = await CommunityService.getCommunityMessages(
            communityId,
            limitNum,
            before as string
        );

        res.status(200).json(new ApiResponse({ data: messages, message: "Messages retrieved successfully" }));
    }
);

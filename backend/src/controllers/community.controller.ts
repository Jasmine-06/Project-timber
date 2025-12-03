import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { CommunityService } from "../services/community.service";
import { ApiResponse } from "../advices/ApiResponse";
import { ApiError } from "../advices/ApiError";
import logger from "../utils/logger";
import { z } from "zod";
import { zodErrorFormatter } from "../utils/error.formatter";

// Schemas
const CreateCommunitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

const UpdateCommunitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

const GetCommunityQuerySchema = z.object({
  page: z.string().default("1").transform(Number),
  limit: z.string().default("10").transform(Number),
  search: z.string().default(""),
});

export const CreateCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "CreateCommunityController request");

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    const result = CreateCommunitySchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const community = await CommunityService.createCommunity({
      ...result.data,
      admin_id: req.user._id,
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

    const result = UpdateCommunitySchema.safeParse(req.body);
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

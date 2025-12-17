import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import {
  CreateCommunityController,
  GetAllCommunitiesController,
  GetCommunityByIdController,
  UpdateCommunityController,
  JoinCommunityController,
  LeaveCommunityController,
  DeleteCommunityController,
  AddAdminController,
  RemoveAdminController,
  GetUserCommunitiesController,
  GetCommunityMessagesController,
} from "../controllers/community.controller";

const communityRouter = Router();

// Protected routes (must come before public routes to avoid conflicts)
communityRouter.post("/", AuthMiddleware, CreateCommunityController);
communityRouter.get("/my/communities", AuthMiddleware, GetUserCommunitiesController);

// Public routes
communityRouter.get("/", GetAllCommunitiesController);
communityRouter.get("/:communityId", GetCommunityByIdController);
communityRouter.get("/:communityId/messages", AuthMiddleware, GetCommunityMessagesController);

// Protected routes with params
communityRouter.patch("/:communityId", AuthMiddleware, UpdateCommunityController);
communityRouter.delete("/:communityId", AuthMiddleware, DeleteCommunityController);

communityRouter.post("/:communityId/join", AuthMiddleware, JoinCommunityController);
communityRouter.post("/:communityId/leave", AuthMiddleware, LeaveCommunityController);

// Admin management routes
communityRouter.post("/:communityId/admins", AuthMiddleware, AddAdminController);
communityRouter.delete("/:communityId/admins/:userId", AuthMiddleware, RemoveAdminController);

export default communityRouter;

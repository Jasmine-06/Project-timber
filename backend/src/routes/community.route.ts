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
} from "../controllers/community.controller";

const communityRouter = Router();

// Public routes (if any, e.g., viewing communities)
communityRouter.get("/", GetAllCommunitiesController);
communityRouter.get("/:communityId", GetCommunityByIdController);

// Protected routes
communityRouter.use(AuthMiddleware);

communityRouter.post("/", CreateCommunityController);
communityRouter.patch("/:communityId", UpdateCommunityController);
communityRouter.delete("/:communityId", DeleteCommunityController);

communityRouter.post("/:communityId/join", JoinCommunityController);
communityRouter.post("/:communityId/leave", LeaveCommunityController);

export default communityRouter;

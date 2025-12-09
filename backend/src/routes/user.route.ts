import { Router } from "express";
import {
  AuthMiddleware,
  OptionalAuthMiddleware,
} from "../middlewares/auth.middleware";
import {
  GetAllUserAdminController,
  meController,
} from "../controllers/user.controller";
import {
  GetAllUserController,
  ReactiveUserController,
  SuspendedUserController,
  FollowUserController,
  UnfollowUserController,
  GetUserFollowersController,
  GetUserFollowingController,
  GetUserProfileController,
  UpdateUserProfileController,
} from "../controllers/user.controller";
import { isAdmin } from "../middlewares/role.middleware";

const userRouter = Router();

userRouter.get("/", GetAllUserController);

// Public profile route with optional auth for "isFollowing" check
userRouter.get(
  "/profile/:username",
  OptionalAuthMiddleware,
  GetUserProfileController
);

userRouter.use(AuthMiddleware);

userRouter.put("/profile", UpdateUserProfileController);

// Follow/Unfollow routes
userRouter.post("/:userId/follow", FollowUserController);
userRouter.delete("/:userId/unfollow", UnfollowUserController);

// Get Followers/Following routes
userRouter.get("/:userId/followers", GetUserFollowersController);
userRouter.get("/:userId/following", GetUserFollowingController);

userRouter.get("/me", meController);

userRouter.use(isAdmin);

// admin routes
userRouter.get("/admin", GetAllUserAdminController);

userRouter.put("/:userId/suspend", SuspendedUserController);
userRouter.put("/:userId/reactive", ReactiveUserController);

export default userRouter;

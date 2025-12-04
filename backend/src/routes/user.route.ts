import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { meController } from "../controllers/user.controller";
import {
  GetAllUserController,
  ReactiveUserController,
  SuspendedUserController,
  FollowUserController,
  UnfollowUserController,
  GetUserFollowersController,
  GetUserFollowingController,
} from "../controllers/user.controller";
import { isAdmin } from "../middlewares/role.middleware";

const userRouter = Router();


userRouter.get("/", GetAllUserController);

userRouter.use(AuthMiddleware);

userRouter.get("/me", meController);

userRouter.use(isAdmin);
userRouter.put("/:userId/suspend", SuspendedUserController);
userRouter.put("/:userId/reactive", ReactiveUserController);

// Follow/Unfollow routes
userRouter.post("/:userId/follow", FollowUserController);
userRouter.delete("/:userId/unfollow", UnfollowUserController);

// Get Followers/Following routes
userRouter.get("/:userId/followers", GetUserFollowersController);
userRouter.get("/:userId/following", GetUserFollowingController);

export default userRouter;

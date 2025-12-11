import { Router } from "express";
import {
  AuthMiddleware,
  OptionalAuthMiddleware,
} from "../middlewares/auth.middleware";
import {
  CreatePostController,
  GetAllPostsController,
  GetPostsByUsernameController,
  GetPostByIdController,
  UpdatePostController,
  DeletePostController,
  CreateCommentController,
  GetCommentsController,
  UpdateCommentController,
  DeleteCommentController,
  ToggleLikeController,
  ToggleBookmarkController,
  GetBookmarkedPostsController,
} from "../controllers/post.controller";

const postRouter = Router();

// Public routes
postRouter.get("/", OptionalAuthMiddleware, GetAllPostsController);
postRouter.get("/user/:username", GetPostsByUsernameController);

// Bookmarks route - must be before /:postId to avoid route conflict
postRouter.get("/bookmarks", AuthMiddleware, GetBookmarkedPostsController);

postRouter.get("/:postId/comments", GetCommentsController);
postRouter.get("/:postId", GetPostByIdController);

// Protected routes
postRouter.use(AuthMiddleware);

// Interaction Routes (Like/Bookmark)
postRouter.post("/like", ToggleLikeController);
postRouter.post("/bookmark", ToggleBookmarkController);

// Post Routes
postRouter.post("/", CreatePostController);
postRouter.patch("/:postId", UpdatePostController);
postRouter.delete("/:postId", DeletePostController);

// Comment Routes
// NOTE: Create comment expects post_id in the body
postRouter.post("/comments", CreateCommentController);
postRouter.patch("/comments/:commentId", UpdateCommentController);
postRouter.delete("/comments/:commentId", DeleteCommentController);

export default postRouter;

import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { PostService } from "../services/post.service";
import { ApiResponse } from "../advices/ApiResponse";
import { ApiError } from "../advices/ApiError";
import logger from "../utils/logger";
import { zodErrorFormatter } from "../utils/error.formatter";
import {
  CreatePostSchema,
  UpdatePostSchema,
  CreateCommentSchema,
  LikePostSchema,
  BookmarkPostSchema,
} from "../schema/post.schema";

export const CreatePostController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "CreatePostController request");

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    const result = CreatePostSchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const post = await PostService.createPost(req.user._id, result.data);

    res.status(201).json(
      new ApiResponse({
        post,
        message: "Post created successfully",
      })
    );
  }
);

export const GetAllPostsController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ query: req.query }, "GetAllPostsController request");

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const userId = req.user?._id ? String(req.user._id) : undefined;

    const data = await PostService.getAllPosts(page, limit, userId);

    res.status(200).json(
      new ApiResponse({
        ...data,
        message: "Posts retrieved successfully",
      })
    );
  }
);

export const GetPostsByUsernameController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug(
      { params: req.params, query: req.query },
      "GetPostsByUsernameController request"
    );

    const { username } = req.params;
    if (!username) {
      throw new ApiError(400, "Username is required");
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const data = await PostService.getPostsByUsername(username, page, limit);

    res.status(200).json(
      new ApiResponse({
        ...data,
        message: "User posts retrieved successfully",
      })
    );
  }
);

export const GetPostByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "GetPostByIdController request");
    const { postId } = req.params;

    if (!postId) {
      throw new ApiError(400, "Post ID is required");
    }

    const post = await PostService.getPostById(postId);

    res.status(200).json(
      new ApiResponse({
        post,
        message: "Post retrieved successfully",
      })
    );
  }
);

export const UpdatePostController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug(
      { params: req.params, body: req.body },
      "UpdatePostController request"
    );
    const { postId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!postId) {
      throw new ApiError(400, "Post ID is required");
    }

    const result = UpdatePostSchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const updatedPost = await PostService.updatePost(
      postId,
      req.user._id,
      result.data
    );

    res.status(200).json(
      new ApiResponse({
        post: updatedPost,
        message: "Post updated successfully",
      })
    );
  }
);

export const DeletePostController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "DeletePostController request");
    const { postId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!postId) {
      throw new ApiError(400, "Post ID is required");
    }

    const result = await PostService.deletePost(postId, req.user._id);

    res.status(200).json(new ApiResponse(result));
  }
);

// Comment Controllers
export const CreateCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "CreateCommentController request");

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    // If postId is in params, we might want to inject it into body for validation if schema requires it
    // But schema requires post_id.
    const result = CreateCommentSchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const comment = await PostService.createComment(req.user._id, result.data);

    res.status(201).json(
      new ApiResponse({
        comment,
        message: "Comment added successfully",
      })
    );
  }
);

export const GetCommentsController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "GetCommentsController request");
    // Expect postId in params
    const { postId } = req.params;

    if (!postId) {
      throw new ApiError(400, "Post ID is required");
    }

    const comments = await PostService.getCommentsByPostId(postId);

    res.status(200).json(
      new ApiResponse({
        comments,
        message: "Comments retrieved successfully",
      })
    );
  }
);

export const UpdateCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug(
      { params: req.params, body: req.body },
      "UpdateCommentController request"
    );
    const { commentId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!commentId) {
      throw new ApiError(400, "Comment ID is required");
    }

    const { content } = req.body;
    if (!content) {
      throw new ApiError(400, "Content cannot be empty");
    }
    // Optionally use Zod schema if available
    // const result = UpdateCommentSchema.safeParse(req.body);

    const updatedComment = await PostService.updateComment(
      commentId,
      req.user._id,
      content
    );

    res.status(200).json(
      new ApiResponse({
        comment: updatedComment,
        message: "Comment updated successfully",
      })
    );
  }
);

export const DeleteCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ params: req.params }, "DeleteCommentController request");
    const { commentId } = req.params;

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    if (!commentId) {
      throw new ApiError(400, "Comment ID is required");
    }

    const result = await PostService.deleteComment(commentId, req.user._id);

    res.status(200).json(new ApiResponse(result));
  }
);

// Like & Bookmark Controllers
export const ToggleLikeController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "ToggleLikeController request");

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    const result = LikePostSchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const response = await PostService.toggleLike(
      result.data.post_id,
      req.user._id
    );

    res.status(200).json(new ApiResponse(response));
  }
);

export const ToggleBookmarkController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ body: req.body }, "ToggleBookmarkController request");

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    const result = BookmarkPostSchema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation Error",
        zodErrorFormatter(result.error)
      );
    }

    const response = await PostService.toggleBookmark(
      result.data.post_id,
      req.user._id
    );

    res.status(200).json(new ApiResponse(response));
  }
);

export const GetBookmarkedPostsController = asyncHandler(
  async (req: Request, res: Response) => {
    logger.debug({ query: req.query }, "GetBookmarkedPostsController request");

    if (!req.user?._id) {
      throw new ApiError(401, "Authentication failed");
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const userId = String(req.user._id);

    const data = await PostService.getBookmarkedPosts(page, limit, userId);

    res.status(200).json(
      new ApiResponse({
        ...data,
        message: "Bookmarked posts retrieved successfully",
      })
    );
  }
);

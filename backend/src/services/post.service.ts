import { PostRepository } from "../repositories/post.repositories";
import { ApiError } from "../advices/ApiError";
import logger from "../utils/logger";

import { UserRepository } from "../repositories/user.repository";

export const PostService = {
  createPost: async (
    userId: string,
    data: { caption?: string; images?: string[]; videos?: string[] }
  ) => {
    logger.debug({ userId, data }, "createPost service called");
    const post = await PostRepository.createPost({ ...data, user_id: userId });
    return post;
  },

  getAllPosts: async (page: number, limit: number, userId?: string) => {
    logger.debug({ page, limit, userId }, "getAllPosts service called");
    const skip = (page - 1) * limit;

    let posts;
    let totalPosts;

    if (userId) {
      // Fetch users the current user is following
      const user = await UserRepository.findUserById(userId, { following: 1 });
      const followingIds = user?.following?.map((id: any) => String(id)) || [];

      // If user follows people, show their posts
      if (followingIds.length > 0) {
        // Include user's own posts? Typically yes, or maybe not.
        // The prompt said "following basis". Often includes self.
        // Let's add self to the list.
        followingIds.push(userId);

        // Priorities following posts (and self), then global posts
        posts = await PostRepository.findFeedWithPriority(
          followingIds,
          skip,
          limit
        );
        // Since we include global posts, the total count is essentially all posts
        // The aggregation just reorders them.
        totalPosts = await PostRepository.countAllPosts();
      } else {
        // Not following anyone -> Global feed
        posts = await PostRepository.findAllPosts(skip, limit);
        totalPosts = await PostRepository.countAllPosts();
      }
    } else {
      // Not logged in -> Global feed (Random/Latest)
      posts = await PostRepository.findAllPosts(skip, limit);
      totalPosts = await PostRepository.countAllPosts();
    }

    // If user is authenticated, append isLiked, isBookmarked, and userComment
    if (userId && posts.length > 0) {
      const postIds = posts.map((post: any) => String(post._id));

      // Batch fetch user interactions and counts
      const [likedPostIds, bookmarkedPostIds, userCommentsMap, likesCountMap, commentsCountMap] =
        await Promise.all([
          PostRepository.findUserLikesForPosts(postIds, userId),
          PostRepository.findUserBookmarksForPosts(postIds, userId),
          PostRepository.findUserCommentsForPosts(postIds, userId),
          PostRepository.countLikesForPosts(postIds),
          PostRepository.countCommentsForPosts(postIds),
        ]);

      // Create sets for O(1) lookup
      const likedSet = new Set(likedPostIds);
      const bookmarkedSet = new Set(bookmarkedPostIds);

      // Append interaction data to each post
      posts = posts.map((post: any) => {
        const postId = String(post._id);
        return {
          ...post,
          isLiked: likedSet.has(postId),
          isBookmarked: bookmarkedSet.has(postId),
          userComment: userCommentsMap[postId] || null,
          likes: likesCountMap[postId] || 0,
          comments: commentsCountMap[postId] || 0,
        };
      });
    } else if (posts.length > 0) {
      // For unauthenticated users, still include counts and set interaction flags to false
      const postIds = posts.map((post: any) => String(post._id));

      const [likesCountMap, commentsCountMap] = await Promise.all([
        PostRepository.countLikesForPosts(postIds),
        PostRepository.countCommentsForPosts(postIds),
      ]);

      posts = posts.map((post: any) => {
        const postId = String(post._id);
        return {
          ...post,
          likes: likesCountMap[postId] || 0,
          comments: commentsCountMap[postId] || 0,
          isLiked: false,
          isBookmarked: false,
          userComment: null,
        };
      });
    }

    const totalPage = Math.ceil(totalPosts / limit);

    return {
      posts,
      totalPosts,
      totalPage,
      currentPage: page,
    };
  },

  getPostsByUsername: async (username: string, page: number, limit: number) => {
    logger.debug(
      { username, page, limit },
      "getPostsByUsername service called"
    );

    // Find user by username
    const user = await UserRepository.findUserByUserName(username);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const userId = String(user._id);

    const skip = (page - 1) * limit;
    const posts = await PostRepository.findPostsByUserId(userId, skip, limit);
    const totalPosts = await PostRepository.countPostsByUserId(userId);
    const totalPage = Math.ceil(totalPosts / limit);

    return {
      posts,
      totalPosts,
      totalPage,
      currentPage: page,
    };
  },

  getPostById: async (postId: string) => {
    logger.debug({ postId }, "getPostById service called");
    const post = await PostRepository.findPostById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }
    return post;
  },

  updatePost: async (
    postId: string,
    userId: string,
    data: { caption?: string }
  ) => {
    logger.debug({ postId, userId, data }, "updatePost service called");
    const post: any = await PostRepository.findPostById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    // Check ownership
    // Since we use lean(), user_id is the populated user object
    const postOwnerId = post.user_id?._id
      ? String(post.user_id._id)
      : String(post.user_id);

    if (postOwnerId !== userId) {
      throw new ApiError(403, "You are not authorized to update this post");
    }

    const updatedPost = await PostRepository.updatePost(postId, data);
    return updatedPost;
  },

  deletePost: async (postId: string, userId: string) => {
    logger.debug({ postId, userId }, "deletePost service called");
    const post: any = await PostRepository.findPostById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const postOwnerId = post.user_id?._id
      ? String(post.user_id._id)
      : String(post.user_id);

    if (postOwnerId !== userId) {
      throw new ApiError(403, "You are not authorized to delete this post");
    }

    await PostRepository.deletePostById(postId);
    return { message: "Post deleted successfully" };
  },

  // Comments
  createComment: async (
    userId: string,
    data: { post_id: string; content: string; parent_id?: string }
  ) => {
    logger.debug({ userId, data }, "createComment service called");
    const post = await PostRepository.findPostById(data.post_id);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = await PostRepository.createComment({
      ...data,
      user_id: userId,
    });
    return comment;
  },

  getCommentsByPostId: async (postId: string) => {
    logger.debug({ postId }, "getCommentsByPostId service called");
    const comments = await PostRepository.findCommentsByPostId(postId);
    return comments;
  },

  deleteComment: async (commentId: string, userId: string) => {
    logger.debug({ commentId, userId }, "deleteComment service called");
    const comment: any = await PostRepository.findCommentById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (String(comment.user_id) !== userId) {
      throw new ApiError(403, "You can only delete your own comments");
    }

    await PostRepository.deleteCommentById(commentId);
    return { message: "Comment deleted successfully" };
  },

  updateComment: async (commentId: string, userId: string, content: string) => {
    logger.debug({ commentId, userId }, "updateComment service called");
    const comment: any = await PostRepository.findCommentById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (String(comment.user_id) !== userId) {
      throw new ApiError(403, "You can only update your own comments");
    }

    const updatedComment = await PostRepository.updateComment(
      commentId,
      content
    );
    return updatedComment;
  },

  // Likes
  toggleLike: async (postId: string, userId: string) => {
    logger.debug({ postId, userId }, "toggleLike service called");
    const post = await PostRepository.findPostById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const existingLike = await PostRepository.findLike(postId, userId);
    if (existingLike) {
      await PostRepository.deleteLike(postId, userId);
      return { message: "Post unliked", isLiked: false };
    } else {
      await PostRepository.createLike(postId, userId);
      return { message: "Post liked", isLiked: true };
    }
  },

  // Bookmarks
  toggleBookmark: async (postId: string, userId: string) => {
    logger.debug({ postId, userId }, "toggleBookmark service called");
    const existingBookmark = await PostRepository.findBookmark(postId, userId);

    if (existingBookmark) {
      await PostRepository.deleteBookmark(postId, userId);
      return { message: "Bookmark removed successfully" };
    } else {
      await PostRepository.createBookmark(postId, userId);
      return { message: "Post bookmarked successfully" };
    }
  },

  getBookmarkedPosts: async (page: number, limit: number, userId: string) => {
    logger.debug({ page, limit, userId }, "getBookmarkedPosts service called");
    const skip = (page - 1) * limit;

    let posts = await PostRepository.findBookmarkedPostsByUserId(
      userId,
      skip,
      limit
    );
    const totalPosts = await PostRepository.countBookmarkedPostsByUserId(userId);

    // Append interaction data to each post
    if (posts.length > 0) {
      const postIds = posts.map((post: any) => String(post._id));

      // Batch fetch user interactions and counts
      const [likedPostIds, bookmarkedPostIds, userCommentsMap, likesCountMap, commentsCountMap] =
        await Promise.all([
          PostRepository.findUserLikesForPosts(postIds, userId),
          PostRepository.findUserBookmarksForPosts(postIds, userId),
          PostRepository.findUserCommentsForPosts(postIds, userId),
          PostRepository.countLikesForPosts(postIds),
          PostRepository.countCommentsForPosts(postIds),
        ]);

      // Create sets for O(1) lookup
      const likedSet = new Set(likedPostIds);
      const bookmarkedSet = new Set(bookmarkedPostIds);

      // Append interaction data to each post
      posts = posts.map((post: any) => {
        const postId = String(post._id);
        return {
          ...post,
          isLiked: likedSet.has(postId),
          isBookmarked: bookmarkedSet.has(postId),
          userComment: userCommentsMap[postId] || null,
          likes: likesCountMap[postId] || 0,
          comments: commentsCountMap[postId] || 0,
        };
      });
    }

    const totalPage = Math.ceil(totalPosts / limit);

    return {
      posts,
      totalPosts,
      totalPage,
      currentPage: page,
    };
  },
};

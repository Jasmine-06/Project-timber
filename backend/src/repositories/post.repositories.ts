import { Post } from "../models/post.model";
import { PostComment } from "../models/post-comment.model";
import { PostLike } from "../models/post-like.model";
import { PostBookmark } from "../models/post-bookmark.model";
import { Types } from "mongoose";

export const PostRepository = {
  // Post Methods
  createPost: async (data: any) => {
    return await Post.create(data);
  },

  findPostsByAuthors: async (
    authorIds: string[],
    skip: number,
    limit: number
  ) => {
    return await Post.find({
      user_id: { $in: authorIds.map((id) => new Types.ObjectId(id) as any) },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id", "name username profile_picture")
      .lean();
  },

  findFeedWithPriority: async (
    authorIds: string[],
    skip: number,
    limit: number
  ) => {
    const followingObjectIds = authorIds.map((id) => new Types.ObjectId(id));
    return await Post.aggregate([
      {
        $addFields: {
          isFollowing: { $in: ["$user_id", followingObjectIds] },
        },
      },
      {
        $sort: { isFollowing: -1, createdAt: -1 },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_details",
        },
      },
      {
        $unwind: "$user_details",
      },
      {
        $project: {
          images: 1,
          videos: 1,
          caption: 1,
          createdAt: 1,
          updatedAt: 1,
          user_id: {
            _id: "$user_details._id",
            name: "$user_details.name",
            username: "$user_details.username",
            profile_picture: "$user_details.profile_picture",
          },
        },
      },
    ]);
  },

  countPostsByAuthors: async (authorIds: string[]) => {
    return await Post.countDocuments({
      user_id: { $in: authorIds.map((id) => new Types.ObjectId(id) as any) },
    });
  },

  findPostsByUserId: async (userId: string, skip: number, limit: number) => {
    return await Post.find({ user_id: new Types.ObjectId(userId) as any })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id", "name username profile_picture")
      .lean();
  },

  countPostsByUserId: async (userId: string) => {
    return await Post.countDocuments({
      user_id: new Types.ObjectId(userId) as any,
    });
  },

  findAllPosts: async (skip: number, limit: number) => {
    return await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id", "name username profile_picture")
      .lean();
  },

  countAllPosts: async () => {
    return await Post.countDocuments();
  },

  findPostById: async (id: string) => {
    return await Post.findById(id)
      .populate("user_id", "name username profile_picture")
      .lean();
  },

  updatePost: async (id: string, data: any) => {
    return await Post.findByIdAndUpdate(id, data, { new: true });
  },

  deletePostById: async (id: string) => {
    return await Post.findByIdAndDelete(id);
  },

  // Comment Methods
  createComment: async (data: any) => {
    const comment = await PostComment.create({
      ...data,
      post_id: new Types.ObjectId(data.post_id),
      user_id: new Types.ObjectId(data.user_id),
      parent_id: data.parent_id
        ? new Types.ObjectId(data.parent_id)
        : undefined,
    });

    // Cast to any to avoid TS errors with populate on generic return
    return await (comment as any).populate(
      "user_id",
      "name username profile_picture"
    );
  },

  findCommentsByPostId: async (postId: string) => {
    return await PostComment.find({
      post_id: new Types.ObjectId(postId) as any,
    })
      .sort({ createdAt: -1 })
      .populate("user_id", "name username profile_picture")
      .lean();
  },

  deleteCommentById: async (commentId: string) => {
    return await PostComment.findByIdAndDelete(commentId);
  },

  findCommentById: async (commentId: string) => {
    return await PostComment.findById(commentId);
  },

  updateComment: async (commentId: string, content: string) => {
    return await PostComment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    ).populate("user_id", "name username profile_picture");
  },

  // Like Methods
  findLike: async (postId: string, userId: string) => {
    return await PostLike.findOne({
      post_id: new Types.ObjectId(postId) as any,
      user_id: new Types.ObjectId(userId) as any,
    });
  },

  createLike: async (postId: string, userId: string) => {
    return await PostLike.create({
      post_id: new Types.ObjectId(postId),
      user_id: new Types.ObjectId(userId),
    });
  },

  deleteLike: async (postId: string, userId: string) => {
    return await PostLike.findOneAndDelete({
      post_id: new Types.ObjectId(postId) as any,
      user_id: new Types.ObjectId(userId) as any,
    });
  },

  countLikes: async (postId: string) => {
    return await PostLike.countDocuments({
      post_id: new Types.ObjectId(postId) as any,
    });
  },

  // Bookmark Methods
  findBookmark: async (postId: string, userId: string) => {
    return await PostBookmark.findOne({
      post_id: new Types.ObjectId(postId) as any,
      user_id: new Types.ObjectId(userId) as any,
    });
  },

  createBookmark: async (postId: string, userId: string) => {
    return await PostBookmark.create({
      post_id: new Types.ObjectId(postId),
      user_id: new Types.ObjectId(userId),
    });
  },

  deleteBookmark: async (postId: string, userId: string) => {
    return await PostBookmark.findOneAndDelete({
      post_id: new Types.ObjectId(postId) as any,
      user_id: new Types.ObjectId(userId) as any,
    });
  },

  // Batch query methods for user interactions
  findUserLikesForPosts: async (postIds: string[], userId: string) => {
    const likes = await PostLike.find({
      post_id: { $in: postIds.map((id) => new Types.ObjectId(id)) },
      user_id: new Types.ObjectId(userId) as any,
    }).lean();
    return likes.map((like: any) => String(like.post_id));
  },

  findUserBookmarksForPosts: async (postIds: string[], userId: string) => {
    const bookmarks = await PostBookmark.find({
      post_id: { $in: postIds.map((id) => new Types.ObjectId(id)) },
      user_id: new Types.ObjectId(userId) as any,
    }).lean();
    return bookmarks.map((bookmark: any) => String(bookmark.post_id));
  },

  findUserCommentsForPosts: async (postIds: string[], userId: string) => {
    const comments = await PostComment.find({
      post_id: { $in: postIds.map((id) => new Types.ObjectId(id)) },
      user_id: new Types.ObjectId(userId) as any,
    })
      .sort({ createdAt: -1 })
      .populate("user_id", "name username profile_picture")
      .lean();

    // Create a map of post_id to the user's most recent comment
    const commentMap: Record<string, any> = {};
    for (const comment of comments) {
      const postId = String((comment as any).post_id);
      if (!commentMap[postId]) {
        commentMap[postId] = comment;
      }
    }
    return commentMap;
  },

  findBookmarkedPostsByUserId: async (
    userId: string,
    skip: number,
    limit: number
  ) => {
    const bookmarks = await PostBookmark.find({
      user_id: new Types.ObjectId(userId) as any,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const postIds = bookmarks.map((bookmark: any) =>
      new Types.ObjectId(bookmark.post_id)
    );

    if (postIds.length === 0) {
      return [];
    }

    // Fetch the posts with user details
    return await Post.find({ _id: { $in: postIds } })
      .populate("user_id", "name username profile_picture")
      .lean();
  },

  countBookmarkedPostsByUserId: async (userId: string) => {
    return await PostBookmark.countDocuments({
      user_id: new Types.ObjectId(userId) as any,
    });
  },

  // Batch count methods for likes and comments
  countLikesForPosts: async (postIds: string[]) => {
    const counts = await PostLike.aggregate([
      {
        $match: {
          post_id: { $in: postIds.map((id) => new Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id: "$post_id",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to a map for easy lookup
    const countMap: Record<string, number> = {};
    for (const item of counts) {
      countMap[String(item._id)] = item.count;
    }
    return countMap;
  },

  countCommentsForPosts: async (postIds: string[]) => {
    const counts = await PostComment.aggregate([
      {
        $match: {
          post_id: { $in: postIds.map((id) => new Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id: "$post_id",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to a map for easy lookup
    const countMap: Record<string, number> = {};
    for (const item of counts) {
      countMap[String(item._id)] = item.count;
    }
    return countMap;
  },
};

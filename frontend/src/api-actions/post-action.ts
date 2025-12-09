import axiosInstance from "@/lib/axios-interceptor";
import {
  ICreatePostSchema,
  IUpdatePostSchema,
  ICreateCommentSchema,
  IUpdateCommentSchema,
  ILikePostSchema,
  IBookmarkPostSchema,
} from "@/schema/post.schema";

export const PostActions = {
  // Get all posts (public)
  GetAllPostsAction: async (): Promise<IPost[]> => {
    const response = await axiosInstance.get<ApiResponse<{ posts: IPost[], total: number, page: number, limit: number }>>("/post");
    return response.data.data!.posts;
  },

  // Get posts by username (public)
  GetPostsByUsernameAction: async (username: string): Promise<IPost[]> => {
    const response = await axiosInstance.get<ApiResponse<{ posts: IPost[], total: number, page: number, limit: number }>>(
      `/post/user/${username}`
    );
    return response.data.data!.posts;
  },

  // Get post by ID (public)
  GetPostByIdAction: async (postId: string): Promise<IPost> => {
    const response = await axiosInstance.get<ApiResponse<IPost>>(
      `/post/${postId}`
    );
    return response.data.data!;
  },

  // Get post comments (public)
  GetPostCommentsAction: async (postId: string): Promise<IComment[]> => {
    const response = await axiosInstance.get<ApiResponse<IComment[]>>(
      `/post/${postId}/comments`
    );
    return response.data.data!;
  },

  // Create a new post (protected)
  CreatePostAction: async (data: ICreatePostSchema): Promise<IPost> => {
    const response = await axiosInstance.post<ApiResponse<IPost>>(
      "/post",
      data
    );
    return response.data.data!;
  },

  // Update a post (protected)
  UpdatePostAction: async (
    postId: string,
    data: IUpdatePostSchema
  ): Promise<IPost> => {
    const response = await axiosInstance.patch<ApiResponse<IPost>>(
      `/post/${postId}`,
      data
    );
    return response.data.data!;
  },

  // Delete a post (protected)
  DeletePostAction: async (postId: string): Promise<IUniversalMessage> => {
    const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(
      `/post/${postId}`
    );
    return response.data.data!;
  },

  // Create a comment (protected)
  CreateCommentAction: async (
    data: ICreateCommentSchema
  ): Promise<IComment> => {
    const response = await axiosInstance.post<ApiResponse<IComment>>(
      "/post/comments",
      data
    );
    return response.data.data!;
  },

  // Update a comment (protected)
  UpdateCommentAction: async (
    commentId: string,
    data: IUpdateCommentSchema
  ): Promise<IComment> => {
    const response = await axiosInstance.patch<ApiResponse<IComment>>(
      `/post/comments/${commentId}`,
      data
    );
    return response.data.data!;
  },

  // Delete a comment (protected)
  DeleteCommentAction: async (
    commentId: string
  ): Promise<IUniversalMessage> => {
    const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(
      `/post/comments/${commentId}`
    );
    return response.data.data!;
  },

  // Toggle like (protected)
  ToggleLikeAction: async (data: ILikePostSchema): Promise<IUniversalMessage> => {
    const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>(
      "/post/like",
      data
    );
    return response.data.data!;
  },

  // Toggle bookmark (protected)
  ToggleBookmarkAction: async (
    data: IBookmarkPostSchema
  ): Promise<IUniversalMessage> => {
    const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>(
      "/post/bookmark",
      data
    );
    return response.data.data!;
  },
};

import axiosInstance from "@/lib/axios-interceptor";
import { IGetUserQuerySchema } from "@/schema/auth.schema";

export const UserActions = {
  // Get current authenticated user
  GetCurrentUserAction: async (): Promise<IUser> => {
    const response = await axiosInstance.get<ApiResponse<IUser>>("/user/me");
    return response.data.data!;
  },

  // Get all users with pagination and search
  GetAllUsersAction: async (
    params?: IGetUserQuerySchema
  ): Promise<IGetAllUserResponse> => {
    const response = await axiosInstance.get<ApiResponse<IGetAllUserResponse>>(
      "/user/",
      {
        params,
      }
    );
    return response.data.data!;
  },

  // Admin: Suspend a user
  SuspendUserAction: async (userId: string): Promise<ISuspendedResponse> => {
    const response = await axiosInstance.put<ApiResponse<ISuspendedResponse>>(
      `/user/${userId}/suspend`
    );
    return response.data.data!;
  },

  // Admin: Reactivate a suspended user
  ReactiveUserAction: async (userId: string): Promise<IReactiveResponse> => {
    const response = await axiosInstance.put<ApiResponse<IReactiveResponse>>(
      `/user/${userId}/reactive`
    );
    return response.data.data!;
  },

  // Follow a user
  FollowUserAction: async (userId: string): Promise<IUniversalMessage> => {
    const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>(
      `/user/${userId}/follow`
    );
    return response.data.data!;
  },

  // Unfollow a user
  UnfollowUserAction: async (userId: string): Promise<IUniversalMessage> => {
    const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(
      `/user/${userId}/unfollow`
    );
    return response.data.data!;
  },

  // Get user's followers with pagination
  GetUserFollowersAction: async (
    userId: string,
    params?: IGetUserQuerySchema
  ): Promise<IGetFollowersResponse> => {
    const response = await axiosInstance.get<
      ApiResponse<IGetFollowersResponse>
    >(`/user/${userId}/followers`, {
      params,
    });
    return response.data.data!;
  },

  GetUserFollowingAction: async (
    userId: string,
    params?: IGetUserQuerySchema
  ): Promise<IGetFollowingResponse> => {
    const response = await axiosInstance.get<
      ApiResponse<IGetFollowingResponse>
    >(`/user/${userId}/following`, {
      params,
    });
    return response.data.data!;
  },

  // Get user profile by username
  GetUserProfileAction: async (username: string): Promise<IUserProfile> => {
    const response = await axiosInstance.get<
      ApiResponse<{ data: IUserProfile; message: string }>
    >(`/user/profile/${username}`);
    return response.data.data!.data;
  },

  // Update user profile
  UpdateUserProfileAction: async (data: Partial<IUser>): Promise<IUser> => {
    const response = await axiosInstance.put<
      ApiResponse<{ data: IUser; message: string }>
    >("/user/profile", data);
    return response.data.data!.data;
  },

  // Upload media
  UploadMediaAction: async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<{ images: string[]; videos: string[] }> => {
    const response = await axiosInstance.post<
      ApiResponse<{
        data: { images: string[]; videos: string[] };
        message: string;
      }>
    >("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
    return response.data.data!.data;
  },
};

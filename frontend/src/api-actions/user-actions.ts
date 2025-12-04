import axiosInstance from "@/lib/axios-interceptor";
import { IGetUserQuerySchema } from "@/schema/auth.schema";

export const UserActions = {
    // Get current authenticated user
    GetCurrentUserAction: async (): Promise<IUser> => {
        const response = await axiosInstance.get<ApiResponse<IUser>>("/user/me");
        return response.data.data!;
    },

    // Get all users with pagination and search
    GetAllUsersAction: async (params?: IGetUserQuerySchema): Promise<IGetAllUserResponse> => {
        const response = await axiosInstance.get<ApiResponse<IGetAllUserResponse>>("/user/", {
            params,
        });
        return response.data.data!;
    },

    // Admin: Suspend a user
    SuspendUserAction: async (userId: string): Promise<ISuspendedResponse> => {
        const response = await axiosInstance.put<ApiResponse<ISuspendedResponse>>(`/user/${userId}/suspend`);
        return response.data.data!;
    },

    // Admin: Reactivate a suspended user
    ReactiveUserAction: async (userId: string): Promise<IReactiveResponse> => {
        const response = await axiosInstance.put<ApiResponse<IReactiveResponse>>(`/user/${userId}/reactive`);
        return response.data.data!;
    },

    // Follow a user
    FollowUserAction: async (userId: string): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>(`/user/${userId}/follow`);
        return response.data.data!;
    },

    // Unfollow a user
    UnfollowUserAction: async (userId: string): Promise<IUniversalMessage> => {
        const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(`/user/${userId}/unfollow`);
        return response.data.data!;
    },

    // Get user's followers with pagination
    GetUserFollowersAction: async (userId: string, params?: IGetUserQuerySchema): Promise<IGetFollowersResponse> => {
        const response = await axiosInstance.get<ApiResponse<IGetFollowersResponse>>(`/user/${userId}/followers`, {
            params,
        });
        return response.data.data!;
    },

    // Get user's following with pagination
    GetUserFollowingAction: async (userId: string, params?: IGetUserQuerySchema): Promise<IGetFollowingResponse> => {
        const response = await axiosInstance.get<ApiResponse<IGetFollowingResponse>>(`/user/${userId}/following`, {
            params,
        });
        return response.data.data!;
    },
}

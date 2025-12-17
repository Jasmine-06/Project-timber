import axiosInstance from "@/lib/axios-interceptor";

export const CommunityActions = {
    // Get all communities (public)
    GetAllCommunitiesAction: async (
        page: number = 1,
        limit: number = 10,
        search: string = ""
    ): Promise<IGetCommunitiesResponse> => {
        const response = await axiosInstance.get<ApiResponse<IGetCommunitiesResponse>>(
            `/community?page=${page}&limit=${limit}&search=${search}`
        );
        return response.data.data!;
    },

    // Get community by ID (public)
    GetCommunityByIdAction: async (communityId: string): Promise<ICommunity> => {
        const response = await axiosInstance.get<ApiResponse<{ community: ICommunity }>>(
            `/community/${communityId}`
        );
        return response.data.data!.community;
    },

    // Get user's communities (protected)
    GetUserCommunitiesAction: async (): Promise<ICommunity[]> => {
        const response = await axiosInstance.get<ApiResponse<{ communities: ICommunity[] }>>(
            "/community/my/communities"
        );
        return response.data.data!.communities;
    },

    // Create a new community (protected)
    CreateCommunityAction: async (
        data: ICreateCommunityData
    ): Promise<ICommunity> => {
        const response = await axiosInstance.post<ApiResponse<{ community: ICommunity }>>(
            "/community",
            data
        );
        return response.data.data!.community;
    },

    // Update a community (protected)
    UpdateCommunityAction: async (
        communityId: string,
        data: IUpdateCommunityData
    ): Promise<ICommunity> => {
        const response = await axiosInstance.patch<ApiResponse<{ community: ICommunity }>>(
            `/community/${communityId}`,
            data
        );
        return response.data.data!.community;
    },

    // Delete a community (protected)
    DeleteCommunityAction: async (
        communityId: string
    ): Promise<IUniversalMessage> => {
        const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(
            `/community/${communityId}`
        );
        return response.data.data!;
    },

    // Join a community (protected)
    JoinCommunityAction: async (
        communityId: string
    ): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>(
            `/community/${communityId}/join`
        );
        return response.data.data!;
    },

    // Leave a community (protected)
    LeaveCommunityAction: async (
        communityId: string
    ): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>(
            `/community/${communityId}/leave`
        );
        return response.data.data!;
    },

    // Add admin to community (protected - owner only)
    AddAdminAction: async (
        communityId: string,
        data: IAddAdminData
    ): Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>(
            `/community/${communityId}/admins`,
            data
        );
        return response.data.data!;
    },

    // Remove admin from community (protected - owner only)
    RemoveAdminAction: async (
        communityId: string,
        userId: string
    ): Promise<IUniversalMessage> => {
        const response = await axiosInstance.delete<ApiResponse<IUniversalMessage>>(
            `/community/${communityId}/admins/${userId}`
        );
        return response.data.data!;
    },

    // Get community messages (protected)
    GetCommunityMessagesAction: async (
        communityId: string,
        limit: number = 50,
        before?: string
    ): Promise<any[]> => {
        let url = `/community/${communityId}/messages?limit=${limit}`;
        if (before) {
            url += `&before=${before}`;
        }
        const response = await axiosInstance.get<ApiResponse<any[]>>(url);
        return response.data.data!;
    },
};

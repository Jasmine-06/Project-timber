import axiosInstance from "@/lib/axios-interceptor";

export const UserAction = {
    getCurrentUser: async () : Promise<{user: IUser}> => {
        const response = await axiosInstance.post<ApiResponse<{user: IUser}>>("/user/me");
        return response.data.data!;
    },
}
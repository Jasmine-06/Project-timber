import axiosInstance from "@/lib/axios-interceptor";

export const UserAction = {
    getCurrentUser: async () : Promise<IUser> => {
        const response = await axiosInstance.get<ApiResponse<IUser>>("/user/me");
        return response.data.data!;
    },
}

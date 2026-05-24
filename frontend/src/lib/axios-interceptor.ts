import { BACKEND_URL } from '@/constants/constant';
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig} from 'axios';
import { getCookie , setCookie} from "cookies-next";
import { useAuthStore } from '@/store/auth-store';
import { AuthActions } from '@/api-actions/auth-action';



const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    async (request: InternalAxiosRequestConfig) => {
        const token = getCookie("auth_token") as string | null;
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }
        if (!request.data || !(request.data instanceof FormData)) {
            request.headers['Content-Type'] = 'application/json';
        }
        return request;
    },
    
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);


axiosInstance.interceptors.response.use(
    async(response : AxiosResponse) => response,
    async (error: AxiosError<ApiResponse<null>>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Don't attempt refresh if:
        // 1. The request is already a retry
        // 2. The request is to the logout endpoint
        // 3. The request is to the refresh-token endpoint itself
        const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
        const isRefreshRequest = originalRequest.url?.includes('/auth/refresh-token');
        
        if (error.response?.status === 401 && !originalRequest._retry && !isLogoutRequest && !isRefreshRequest) {
            originalRequest._retry = true;
            try {
                const response = await axios.post<ApiResponse<ILoginResponse>>(`${BACKEND_URL}/auth/refresh-token`,{} , {
                    withCredentials : true,
                });
                if (response.data.data?.access_token && response.status === 200) {
                    setCookie('auth_token', response.data.data.access_token, {
                        httpOnly: false,
                    });
                    useAuthStore.getState().setLogin(response.data.data);
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Only logout if refresh token is invalid
                await AuthActions.LogoutAction();
                useAuthStore.getState().setLogout();
                return Promise.reject(refreshError);
            }
        }
        
        // Don't automatically logout on all 401 errors
        // Let the calling code handle the error appropriately
        return Promise.reject(error);
    }
);

export default axiosInstance;
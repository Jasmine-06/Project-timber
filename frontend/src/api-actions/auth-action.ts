import axiosInstance from "@/lib/axios-interceptor";
import { ICheckVerificationSchema, IForgotPasswordSchema, ILoginSchema, IRegistrationSchema, IResendVerificationCodeSchema, IResetPasswordSchema, IVerifySchema } from "@/schema/auth.schema";


export const AuthActions = {
    RegisterAction : async (data : IRegistrationSchema) : Promise<IRegisterResponse> => {
        const response = await axiosInstance.post<ApiResponse<IRegisterResponse>>("/auth/register", data);
        return response.data.data!;
    },

    LoginAction : async (data: ILoginSchema) : Promise<ILoginResponse> => {
        const response = await axiosInstance.post<ApiResponse<ILoginResponse>>("/auth/login", data);
        return response.data.data!;
    },

    verifyAction : async (data: IVerifySchema) : Promise<IRegisterResponse> => {
        const response = await axiosInstance.post<ApiResponse<IRegisterResponse>>("/auth/verify", data);
        return response.data.data!;
    },
    
    CheckVerificationAction : async (data: ICheckVerificationSchema) : Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/check-verification-code", data);
        return response.data.data!;
    },

    ForgotPasswordAction : async (data: IForgotPasswordSchema) : Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/forgot", data);
        return response.data.data!;
    },

    ResetPasswordAction : async (data: IResetPasswordSchema) : Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/reset-password", data);
        return response.data.data!;
    },
    
    ResendVerificationAction : async (data: IResendVerificationCodeSchema) : Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/resend-verification", data);
        return response.data.data!;
    },

    LogoutAction : async () : Promise<IUniversalMessage> => {
        const response = await axiosInstance.post<ApiResponse<IUniversalMessage>>("/auth/logout");
        return response.data.data!;
    },

    RefreshAction : async () : Promise<IRefreshResponse> => {
        const response = await axiosInstance.post<ApiResponse<IRefreshResponse>>("/auth/refresh-token");
        return response.data.data!;
    },

}




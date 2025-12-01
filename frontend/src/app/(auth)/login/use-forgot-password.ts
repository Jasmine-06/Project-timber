import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuthActions } from '@/api-actions/auth-action';
import { IForgotPasswordSchema } from '@/schema/auth.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for forgot password mutation using TanStack Query
 * Sends verification code to user's email
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: IForgotPasswordSchema) => AuthActions.ForgotPasswordAction(data),
    onSuccess: () => {
      toast.success('Verification code sent!', {
        description: 'Please check your email for the verification code.',
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to send verification code. Please try again.';
      
      toast.error('Request Failed', {
        description: errorMessage,
      });

      console.error('Forgot password error:', error);
    },
  });
};

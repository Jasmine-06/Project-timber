import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuthActions } from '@/api-actions/auth-action';
import { IResendVerificationCodeSchema } from '@/schema/auth.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for resending OTP verification code using TanStack Query
 * Handles resending verification email
 */
export const useResendOtp = () => {
  return useMutation({
    mutationFn: (data: IResendVerificationCodeSchema) => AuthActions.ResendVerificationAction(data),
    onSuccess: () => {
      // Show success message
      toast.success('Verification code sent!', {
        description: 'Please check your email for the new verification code.',
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to resend code. Please try again.';
      
      toast.error('Resend Failed', {
        description: errorMessage,
      });

      console.error('Resend OTP error:', error);
    },
  });
};

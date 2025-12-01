import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuthActions } from '@/api-actions/auth-action';
import { IResendVerificationCodeSchema } from '@/schema/auth.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for resending reset password verification code using TanStack Query
 */
export const useResendResetCode = () => {
  return useMutation({
    mutationFn: (data: IResendVerificationCodeSchema) => AuthActions.ResendVerificationAction(data),
    onSuccess: () => {
      toast.success('Code resent!', {
        description: 'A new verification code has been sent to your email.',
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to resend code. Please try again.';
      
      toast.error('Resend Failed', {
        description: errorMessage,
      });

      console.error('Resend reset code error:', error);
    },
  });
};

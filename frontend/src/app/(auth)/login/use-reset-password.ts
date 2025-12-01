import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuthActions } from '@/api-actions/auth-action';
import { IResetPasswordSchema } from '@/schema/auth.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for reset password mutation using TanStack Query
 * Verifies OTP and resets user's password
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: IResetPasswordSchema) => AuthActions.ResetPasswordAction(data),
    onSuccess: () => {
      toast.success('Password reset successful!', {
        description: 'You can now sign in with your new password.',
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to reset password. Please try again.';
      
      toast.error('Reset Failed', {
        description: errorMessage,
      });

      console.error('Reset password error:', error);
    },
  });
};

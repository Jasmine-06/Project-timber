import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthActions } from '@/api-actions/auth-action';
import { IVerifySchema } from '@/schema/auth.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for OTP verification mutation using TanStack Query
 * Handles email verification with OTP code
 */
export const useVerifyOtp = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: IVerifySchema) => AuthActions.verifyAction(data),
    onSuccess: (data) => {
      // Show success message
      toast.success('Email verified successfully!', {
        description: `Welcome ${data.user.name}! Your account has been verified.`,
      });

      // Navigate to login page after successful verification
      router.push('/login');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Verification failed. Please try again.';
      
      toast.error('Verification Failed', {
        description: errorMessage,
      });

      console.error('Verification error:', error);
    },
  });
};

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthActions } from '@/api-actions/auth-action';
import { IRegistrationSchema } from '@/schema/auth.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for registration mutation using TanStack Query
 * Handles user registration and navigation to verification/login
 */
export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: IRegistrationSchema) => AuthActions.RegisterAction(data),
    onSuccess: (data) => {
      // Show success message
      toast.success('Registration successful!', {
        description: `Welcome ${data.user.name}! Please check your email to verify your account.`,
      });

      // Navigate to login page or verification page
      // You can change this to '/verify' if you have a verification page
      router.push('/login');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Registration failed. Please try again.';
      
      toast.error('Registration Failed', {
        description: errorMessage,
      });

      console.error('Registration error:', error);
    },
  });
};

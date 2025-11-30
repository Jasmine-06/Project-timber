import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthActions } from '@/api-actions/auth-action';
import { useAuthStore } from '@/store/auth-store';
import { ILoginSchema } from '@/schema/auth.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for login mutation using TanStack Query
 * Handles authentication, token storage, and navigation
 */
export const useLogin = () => {
  const router = useRouter();
  const setLogin = useAuthStore((state) => state.setLogin);

  return useMutation({
    mutationFn: (data: ILoginSchema) => AuthActions.LoginAction(data),
    onSuccess: (data) => {
      // Store auth data in Zustand store and cookies
      setLogin(data);
      
      // Show success message
      toast.success('Login successful!', {
        description: `Welcome back, ${data.user.name}!`,
      });

      // Navigate to homepage
      router.push('/');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Login failed. Please try again.';
      
      toast.error('Login Failed', {
        description: errorMessage,
      });

      console.error('Login error:', error);
    },
  });
};

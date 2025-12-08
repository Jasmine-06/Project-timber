import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserActions } from '@/api-actions/user-actions';
import { AxiosError } from 'axios';

/**
 * Custom hook for reactivating a suspended user using TanStack Query
 * Handles user reactivation and updates the UI
 */
export const useReactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserActions.ReactiveUserAction(userId),
    onSuccess: (data) => {
      // Invalidate and refetch users query to update the table
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Show success message
      toast.success('User Reactivated', {
        description: data.message || `User ${data.data.name} has been reactivated successfully.`,
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to reactivate user. Please try again.';
      
      toast.error('Reactivation Failed', {
        description: errorMessage,
      });

      console.error('Reactivate user error:', error);
    },
  });
};

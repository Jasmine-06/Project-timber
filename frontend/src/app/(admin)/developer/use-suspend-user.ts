import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserActions } from '@/api-actions/user-actions';
import { AxiosError } from 'axios';

/**
 * Custom hook for suspending a user using TanStack Query
 * Handles user suspension and updates the UI
 */
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserActions.SuspendUserAction(userId),
    onSuccess: (data) => {
      // Invalidate and refetch users query to update the table
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Show success message
      toast.success('User Suspended', {
        description: data.message || `User ${data.data.name} has been suspended successfully.`,
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to suspend user. Please try again.';
      
      toast.error('Suspension Failed', {
        description: errorMessage,
      });

      console.error('Suspend user error:', error);
    },
  });
};

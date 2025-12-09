import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PostActions } from '@/api-actions/post-action';
import { ILikePostSchema } from '@/schema/post.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for toggling post like using TanStack Query
 * Handles optimistic updates and query invalidation
 */
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ILikePostSchema) => PostActions.ToggleLikeAction(data),
    onSuccess: (data, variables) => {
      // Invalidate posts query to refresh the feed
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Optional: Show success message
      // toast.success(data.message || 'Post liked');
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to update like. Please try again.';
      
      toast.error('Action Failed', {
        description: errorMessage,
      });

      console.error('Toggle like error:', error);
    },
  });
};

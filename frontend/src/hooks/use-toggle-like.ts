import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PostActions } from '@/api-actions/post-action';
import { ILikePostSchema } from '@/schema/post.schema';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth-store';

/**
 * Custom hook for toggling post like using TanStack Query
 * Handles optimistic updates and query invalidation
 */
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: ILikePostSchema) => PostActions.ToggleLikeAction(data),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<IPost[]>(['posts']);

      // Optimistically update the cache
      queryClient.setQueryData<IPost[]>(['posts'], (old) => {
        if (!old) return old;
        
        return old.map((post) => {
          if (post._id === variables.post_id) {
            const currentIsLiked = post.isLiked || false;
            const currentLikes = typeof post.likes === 'number' ? post.likes : 0;

            return {
              ...post,
              likes: currentIsLiked ? currentLikes - 1 : currentLikes + 1,
              isLiked: !currentIsLiked,
            };
          }
          return post;
        });
      });

      // Return context with previous data for rollback
      return { previousPosts };
    },
    onError: (error: AxiosError<ApiResponse<null>>, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }

      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to update like. Please try again.';
      
      toast.error('Action Failed', {
        description: errorMessage,
      });

      console.error('Toggle like error:', error);
    },
    onSuccess: () => {
      // Don't refetch - rely on optimistic updates for performance
      // The backend should return correct isLiked on initial page load
    },
  });
};

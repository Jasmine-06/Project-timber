import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PostActions } from '@/api-actions/post-action';
import { IBookmarkPostSchema } from '@/schema/post.schema';
import { AxiosError } from 'axios';

/**
 * Custom hook for toggling post bookmark using TanStack Query
 * Handles optimistic updates and query invalidation
 */
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IBookmarkPostSchema) => PostActions.ToggleBookmarkAction(data),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['bookmarkedPosts'] });

      // Snapshot the previous values
      const previousPosts = queryClient.getQueryData<IPost[]>(['posts']);
      const previousBookmarkedPosts = queryClient.getQueryData<IPost[]>(['bookmarkedPosts']);

      // Optimistically update the posts cache
      queryClient.setQueryData<IPost[]>(['posts'], (old) => {
        if (!old) return old;
        
        return old.map((post) => {
          if (post._id === variables.post_id) {
            const currentIsBookmarked = post.isBookmarked || false;

            return {
              ...post,
              isBookmarked: !currentIsBookmarked,
            };
          }
          return post;
        });
      });

      // Optimistically update the bookmarked posts cache
      // If unbookmarking, remove from the list; if bookmarking, we don't add (requires refetch for full data)
      queryClient.setQueryData<IPost[]>(['bookmarkedPosts'], (old) => {
        if (!old) return old;
        
        // Check if post is currently in bookmarked list
        const postIndex = old.findIndex(post => post._id === variables.post_id);
        
        if (postIndex !== -1) {
          // Post is bookmarked, so we're unbookmarking - remove it
          return old.filter(post => post._id !== variables.post_id);
        }
        
        // Post is not in bookmarked list, so we're bookmarking
        // Don't add it here - let the refetch handle it to get full post data
        return old;
      });

      // Return context with previous data for rollback
      return { previousPosts, previousBookmarkedPosts };
    },
    onError: (error: AxiosError<ApiResponse<null>>, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      if (context?.previousBookmarkedPosts) {
        queryClient.setQueryData(['bookmarkedPosts'], context.previousBookmarkedPosts);
      }

      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to update bookmark. Please try again.';
      
      toast.error('Action Failed', {
        description: errorMessage,
      });

      console.error('Toggle bookmark error:', error);
    },
    onSuccess: () => {
      // Refetch bookmarked posts to ensure we have the latest data
      // This is important when bookmarking (adding) to get the full post data
      queryClient.refetchQueries({ queryKey: ['bookmarkedPosts'] });
      
      // Don't refetch posts - rely on optimistic updates for performance
      // The backend should return correct isBookmarked on initial page load
    },
  });
};

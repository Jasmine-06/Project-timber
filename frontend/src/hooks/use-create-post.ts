import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PostActions } from '@/api-actions/post-action';
import { ICreatePostSchema } from '@/schema/post.schema';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth-store';

/**
 * Custom hook for creating a post using TanStack Query
 * Handles post creation, success notifications, and query invalidation
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: ICreatePostSchema) => PostActions.CreatePostAction(data),
    onSuccess: (newPost) => {
      // Show success message
      toast.success('Post created!', {
        description: 'Your post has been shared successfully.',
      });

      // Optimistically update the cache with populated user data
      const completePost = {
        ...newPost,
        user_id: user || newPost.user_id
      };

      queryClient.setQueryData(['posts'], (oldPosts: IPost[] | undefined) => {
        if (!oldPosts) return [completePost];
        return [completePost, ...oldPosts];
      });
      
      // Also invalidate to be safe (eventual consistency)
      queryClient.invalidateQueries({ queryKey: ['posts'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['userPosts'], refetchType: 'active' });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to create post. Please try again.';
      
      toast.error('Post Creation Failed', {
        description: errorMessage,
      });

      console.error('Create post error:', error);
    },
  });
};

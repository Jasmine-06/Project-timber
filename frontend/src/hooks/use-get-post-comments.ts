import { useQuery } from '@tanstack/react-query';
import { PostActions } from '@/api-actions/post-action';

/**
 * Custom hook for fetching comments of a post using TanStack Query
 */
export const useGetPostComments = (postId: string) => {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => PostActions.GetPostCommentsAction(postId),
    enabled: !!postId,
  });
};

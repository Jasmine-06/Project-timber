import { useQuery } from '@tanstack/react-query';
import { PostActions } from '@/api-actions/post-action';

/**
 * Custom hook for fetching a single post by ID using TanStack Query
 */
export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => PostActions.GetPostByIdAction(postId),
    enabled: !!postId, // Only run query if postId is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

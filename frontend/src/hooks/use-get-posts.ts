import { useQuery } from '@tanstack/react-query';
import { PostActions } from '@/api-actions/post-action';

/**
 * Custom hook for fetching all posts using TanStack Query
 * Follows the authentication pattern for data fetching
 */
export const useGetPosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => PostActions.GetAllPostsAction(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

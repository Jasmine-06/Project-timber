import { useQuery } from '@tanstack/react-query';
import { PostActions } from '@/api-actions/post-action';

/**
 * Custom hook for fetching bookmarked posts using TanStack Query
 * Follows the authentication pattern for data fetching
 */
export const useGetBookmarkedPosts = () => {
  return useQuery({
    queryKey: ['bookmarkedPosts'],
    queryFn: () => PostActions.GetBookmarkedPostsAction(),
    staleTime: 0, // Always refetch when invalidated to ensure saved posts list is up-to-date
    refetchOnWindowFocus: true,
  });
};

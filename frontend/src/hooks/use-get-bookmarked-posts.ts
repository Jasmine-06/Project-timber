import { useQuery } from '@tanstack/react-query';
import { PostActions } from '@/api-actions/post-action';
import { useAuthStore } from '@/store/auth-store';

/**
 * Custom hook for fetching bookmarked posts using TanStack Query
 * Follows the authentication pattern for data fetching
 * Only fetches when user is authenticated and enabled is true
 */
export const useGetBookmarkedPosts = (enabled: boolean = true) => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['bookmarkedPosts'],
    queryFn: () => PostActions.GetBookmarkedPostsAction(),
    staleTime: 1000 * 60 * 5, // 5 minutes - same as posts
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    enabled: isAuthenticated && enabled, // Only fetch when user is authenticated AND enabled
  });
};

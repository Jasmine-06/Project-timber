import { useQuery } from '@tanstack/react-query';
import { PostActions } from '@/api-actions/post-action';

/**
 * Custom hook for fetching posts by username using TanStack Query
 * Used on user profile pages to display user's posts
 */
export const useGetPostsByUsername = (username: string) => {
  return useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => PostActions.GetPostsByUsernameAction(username),
    enabled: !!username, // Only run if username exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

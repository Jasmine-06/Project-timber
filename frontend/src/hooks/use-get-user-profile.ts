import { useQuery } from '@tanstack/react-query';
import { UserActions } from '@/api-actions/user-actions';

/**
 * Custom hook for fetching user profile using TanStack Query
 * Prevents duplicate API calls and provides caching
 */
export const useGetUserProfile = (username: string) => {
  return useQuery({
    queryKey: ['userProfile', username],
    queryFn: () => UserActions.GetUserProfileAction(username),
    enabled: !!username, // Only run if username exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for profile pages
  });
};

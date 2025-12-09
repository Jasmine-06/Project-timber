import { useQuery } from '@tanstack/react-query';
import { UserActions } from '@/api-actions/user-actions';

/**
 * Custom hook for fetching following users using TanStack Query
 * Used to display the list of users that a specific user is following
 */
export const useGetFollowing = (userId: string, page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ['following', userId, page, limit],
    queryFn: () => UserActions.GetUserFollowingAction(userId, { page, limit }),
    enabled: !!userId, // Only run if userId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

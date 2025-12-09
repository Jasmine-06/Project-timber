import { useQuery } from '@tanstack/react-query';
import { UserActions } from '@/api-actions/user-actions';

/**
 * Custom hook for fetching user followers
 */
export const useGetFollowers = (userId: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['followers', userId, page, limit],
    queryFn: () => UserActions.GetUserFollowersAction(userId, { page, limit }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

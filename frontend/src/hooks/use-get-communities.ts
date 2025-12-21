import { useQuery } from '@tanstack/react-query';
import { CommunityActions } from '@/api-actions/community-actions';

export const useGetCommunities = (page = 1, limit = 5, search = '') => {
  return useQuery({
    queryKey: ['communities', page, limit, search],
    queryFn: () => CommunityActions.GetAllCommunitiesAction(page, limit, search),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

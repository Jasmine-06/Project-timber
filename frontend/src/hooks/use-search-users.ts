import { UserActions } from "@/api-actions/user-actions";
import { useQuery } from "@tanstack/react-query";

export const useSearchUsers = (search: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["search-users", search],
    queryFn: async () => {
      if (!search)
        return {
          data: [],
          pagination: {
            totalUser: 0,
            totalPage: 0,
            currentPage: 1,
            limit: 10,
          },
          message: "",
        };
      return await UserActions.GetAllUsersAction({ search, page: 1, limit: 5 });
    },
    enabled: !!search,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  return {
    users: data?.data || [], // The API returns { data: IUser[], ... } so we access .data
    isLoading,
    isError,
  };
};

import { UserActions } from "@/api-actions/user-actions";
import { useQuery } from "@tanstack/react-query";

export const useSearchUsers = (search: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["search-users", search],
    queryFn: async () => {
      if (!search) return { users: [], total: 0, page: 1, limit: 10, pages: 0 };
      // The backend API returns { data: IUser[], pagination: ... } inside ApiResponse
      // UserActions.GetAllUsersAction returns IGetAllUserResponse which has { user: IUser[], totalUser... }
      // Wait, let's check UserActions.GetAllUsersAction return type again.
      // It returns response.data.data! which is IGetAllUserResponse.
      return await UserActions.GetAllUsersAction({ search, limit: 5 });
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

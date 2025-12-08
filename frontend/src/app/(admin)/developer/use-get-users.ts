import { UserActions } from "@/api-actions/user-actions";
import { useQuery } from "@tanstack/react-query";
import { IGetAdminUserQuerySchema } from "@/schema/auth.schema";

export const useGetUsers = (params?: IGetAdminUserQuerySchema) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => UserActions.GetAllUsersAdminAction(params),
  });
};

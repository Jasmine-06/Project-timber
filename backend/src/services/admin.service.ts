import { ApiError } from "../advices/ApiError";
import { AdminRepository } from "../repositories/admin.repository";
import type { IGetUserQuerySchema } from "../schema/admin.schema";
import { AccountStatus, UserRole, type IUser } from "../models/user.models";

const ADMIN_PROJECTION = {
  _id: 1,
  name: 1,
  email: 1,
  username: 1,
  is_verified: 1,
  roles: 1,
  account_status: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const AdminService = {
    getAllUser: async (data: IGetUserQuerySchema ) : Promise<{user: IUser[], totalUser: number, totalPage: number, currentPage: number}>=> {
        const {page, limit, search} = data;
        const skip = (page-1)*limit;
        const totalUser = await AdminRepository.countAllUser(search);
        const users = await AdminRepository.findAllUser(ADMIN_PROJECTION, skip, limit, search);
        if(!users) {
            throw new ApiError(404, "fail to retrieve user list");
        }
        const totalPage = Math.ceil(totalUser/limit);
        return {
            user: users,
            totalUser,
            totalPage,
            currentPage: page
        }
        
    },

    suspendUser: async (targetUserId: string) : Promise<IUser> => {
        
        const updateUser = await AdminRepository.updateUserById(
            targetUserId, 
            {account_status: AccountStatus.SUSPENDED}, 
            ADMIN_PROJECTION
        );
        if(!updateUser) {
            throw new ApiError(404, "user not found or update failed");
        }
        if(updateUser.roles.includes(UserRole.ADMIN) && updateUser.account_status === AccountStatus.SUSPENDED) {
            throw new ApiError(400, "An admin can't be suspended");
        }
        return updateUser;
    },

    reactiveUser: async (targetUserId: string) : Promise<IUser> => {
        const updateUser = await AdminRepository.updateUserById(
            targetUserId,
            {account_status: AccountStatus.ACTIVE},
            ADMIN_PROJECTION
        )
        if(!updateUser) {
            throw new ApiError(404, "user not found or update failed");
        }
        return updateUser;
    }
}
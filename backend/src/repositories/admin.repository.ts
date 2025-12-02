import { User, type IUser, type IUserCreateSchema } from "../models/user.models";
import { UserRepository } from "./user.repository";

export const AdminRepository = {
    createSearchFilter: (search: string) => {
        if(!search) return {};
        const searchRegex = new RegExp(search, "i");
        return {
            $or: [
                { name: {$regex: searchRegex} },
                { username: {$regex: searchRegex} },
                { email: {$regex: searchRegex} },
            ]
        }
    },

    countAllUser: async (search: string="") : Promise<number> => {
        const filter = AdminRepository.createSearchFilter(search);
        return await User.countDocuments(filter);
    },


    findAllUser : async (projection?: any, skip?: number, limit?: number, search: string="") : Promise<IUser[]> => {
        const filter = AdminRepository.createSearchFilter(search);
        let query = User.find(filter, projection);
        if(skip !== undefined && limit !== undefined) {
            query = query.skip(skip).limit(limit);
        } 
        query = query.sort({createdAt: -1});
        const users = await query.exec();
        return users;
    },

    updateUserById : async (id: string, updateData: Partial<IUserCreateSchema>, projection?: any) : Promise<IUser | null> => {
        const updateUser = await UserRepository.updateUserById(id, updateData, projection);
        return updateUser;
    },

    deleteUserById: async (id: string) : Promise<Boolean> => {
        const isDeleted = await UserRepository.deleteUserById(id);
        return isDeleted;
    }
}
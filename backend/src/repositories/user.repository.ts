import { User, type IUser, type IUserCreateSchema } from "../models/user.models";

export const UserRepository = {
    createUser : async (userData: IUserCreateSchema, projection?: any) => {
        const user = new User(userData)
        const newUser = await user.save()
        if(projection) {
            return await User.findById(newUser._id, projection)
        }
        return newUser;
    },

    findUserByEmail : async (email: string, projection?: any) => {
        const user = await User.findOne(
            {email}, projection
        )
        return user;
    },

    findUserByUserName : async (username: string, is_verified: boolean = true, projection?: any) => {
        const user = await User.findOne(
            {username, 
                ...(typeof is_verified === "boolean" ? {is_verified} : {}) 
            }, projection
        )
        return user;
    },

    findUserById : async (id: string, projection?: any) => {
        const user = await User.findById(
            id, 
            projection
        )
        return user;
    },

    updateUserById : async (id: string, updateData: Partial<IUserCreateSchema>, projection?: any) : Promise<IUser | null> => {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            {new: true, projection}
        )
        return updatedUser;
    },

    deleteUserById : async (id: string) : Promise<Boolean> => {
        const deletedUser = await User.findByIdAndDelete(
            id
        )
        return !!deletedUser;
    }
}


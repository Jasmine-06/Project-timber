import {
  User,
  type IUser,
  type IUserCreateSchema,
} from "../models/user.models";
import mongoose from "mongoose";

export const USER_PROJECTION = {
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

export const UserRepository = {
  createUser: async (userData: IUserCreateSchema, projection?: any) => {
    const user = new User(userData);
    const newUser = await user.save();
    if (projection) {
      return await User.findById(newUser._id, projection);
    }
    return newUser;
  },

  findUserByEmail: async (email: string, projection?: any) => {
    const user = await User.findOne({ email }, projection);
    return user;
  },

  findUserByUserName: async (
    username: string,
    is_verified: boolean = true,
    projection?: any
  ) => {
    const user = await User.findOne(
      {
        username,
        ...(typeof is_verified === "boolean" ? { is_verified } : {}),
      },
      projection
    );
    return user;
  },

  findUserById: async (id: string, projection?: any) => {
    const user = await User.findById(id, projection);
    return user;
  },

  updateUserById: async (
    id: string,
    updateData: Partial<IUserCreateSchema>,
    projection?: any
  ): Promise<IUser | null> => {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      projection,
    });
    return updatedUser;
  },

  deleteUserById: async (id: string): Promise<Boolean> => {
    const deletedUser = await User.findByIdAndDelete(id);
    return !!deletedUser;
  },

  createSearchFilter: (search: string, account_status?: string) => {
    const filter: any = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: { $regex: searchRegex } },
        { username: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ];
    }

    if (account_status && account_status !== "all") {
      filter.account_status = account_status;
    }

    return filter;
  },

  countAllUser: async (
    search: string = "",
    account_status?: string
  ): Promise<number> => {
    const filter = UserRepository.createSearchFilter(search, account_status);
    return await User.countDocuments(filter);
  },

  findAllUser: async (
    projection?: any,
    skip?: number,
    limit?: number,
    search: string = ""
  ): Promise<IUser[]> => {
    const filter = UserRepository.createSearchFilter(search, "active");
    let query = User.find(filter, projection);
    if (skip !== undefined && limit !== undefined) {
      query = query.skip(skip).limit(limit);
    }
    query = query.sort({ createdAt: -1 });
    const users = await query.exec();
    return users;
  },

  findAllUserAdmin: async (
    projection?: any,
    skip?: number,
    limit?: number,
    search: string = "",
    account_status: string = ""
  ): Promise<IUser[]> => {
    const filter = UserRepository.createSearchFilter(search, account_status);
    let query = User.find(filter, projection);
    if (skip !== undefined && limit !== undefined) {
      query = query.skip(skip).limit(limit);
    }
    query = query.sort({ createdAt: -1 });
    const users = await query.exec();
    return users;
  },

  followUser: async (followerId: string, followingId: string) => {
    // Add followingId to follower's following list
    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: followingId },
    });

    // Add followerId to following's followers list
    await User.findByIdAndUpdate(followingId, {
      $addToSet: { followers: followerId },
    });
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    // Remove followingId from follower's following list
    await User.findByIdAndUpdate(followerId, {
      $pull: { following: followingId },
    });

    // Remove followerId from following's followers list
    await User.findByIdAndUpdate(followingId, {
      $pull: { followers: followerId },
    });
  },

  addCommunityToUser: async (userId: string, communityId: string) => {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { communities: communityId },
    });
  },

  removeCommunityFromUser: async (userId: string, communityId: string) => {
    await User.findByIdAndUpdate(userId, {
      $pull: { communities: communityId },
    });
  },

  removeCommunityFromAllUsers: async (communityId: string) => {
    await User.updateMany(
      { communities: communityId as any },
      { $pull: { communities: communityId } }
    );
  },

  getFollowers: async (userId: string, skip: number, limit: number) => {
    return await User.find({
      following: new mongoose.Types.ObjectId(userId) as any,
    })
      .select("name username email bio")
      .skip(skip)
      .limit(limit);
  },

  countFollowers: async (userId: string) => {
    return await User.countDocuments({
      following: new mongoose.Types.ObjectId(userId) as any,
    });
  },

  getFollowing: async (userId: string, skip: number, limit: number) => {
    return await User.find({
      followers: new mongoose.Types.ObjectId(userId) as any,
    })
      .select("name username email bio")
      .skip(skip)
      .limit(limit);
  },

  countFollowing: async (userId: string) => {
    return await User.countDocuments({
      followers: new mongoose.Types.ObjectId(userId) as any,
    });
  },

  findUserByUsername: async (username: string) => {
    return await User.findOne({ username }).select(
      "-password -verification_code -verification_code_expiry"
    );
  },

  updateUser: async (userId: string, updateData: Partial<IUser>) => {
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");
  },

  isFollowing: async (followerId: string, followingId: string) => {
    const count = await User.countDocuments({
      _id: followingId,
      followers: new mongoose.Types.ObjectId(followerId) as any,
    });
    return count > 0;
  },
};

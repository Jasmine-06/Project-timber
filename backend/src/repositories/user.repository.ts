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
};

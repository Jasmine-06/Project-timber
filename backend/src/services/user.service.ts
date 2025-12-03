import { ApiError } from "../advices/ApiError";
import { AdminRepository } from "../repositories/admin.repository";
import type { IGetUserQuerySchema } from "../schema/admin.schema";
import { AccountStatus, UserRole, type IUser } from "../models/user.models";
import {
  USER_PROJECTION,
  UserRepository,
} from "../repositories/user.repository";
import logger from "../utils/logger";

export const UserService = {
  getAllUser: async (
    data: IGetUserQuerySchema
  ): Promise<{
    user: IUser[];
    totalUser: number;
    totalPage: number;
    currentPage: number;
  }> => {
    const { page, limit, search } = data;
    logger.debug({ page, limit, search }, "getAllUser service called");
    const skip = (page - 1) * limit;
    const totalUser = await AdminRepository.countAllUser(search);
    const users = await AdminRepository.findAllUser(
      USER_PROJECTION,
      skip,
      limit,
      search
    );
    if (!users) {
      throw new ApiError(404, "fail to retrieve user list");
    }
    const totalPage = Math.ceil(totalUser / limit);
    return {
      user: users,
      totalUser,
      totalPage,
      currentPage: page,
    };
  },

  suspendUser: async (targetUserId: string): Promise<IUser> => {
    logger.debug({ targetUserId }, "suspendUser service called");

    const updateUser = await AdminRepository.updateUserById(
      targetUserId,
      { account_status: AccountStatus.SUSPENDED },
      USER_PROJECTION
    );
    if (!updateUser) {
      throw new ApiError(404, "user not found or update failed");
    }
    if (
      updateUser.roles.includes(UserRole.ADMIN) &&
      updateUser.account_status === AccountStatus.SUSPENDED
    ) {
      throw new ApiError(400, "An admin can't be suspended");
    }
    return updateUser;
  },

  reactiveUser: async (targetUserId: string): Promise<IUser> => {
    logger.debug({ targetUserId }, "reactiveUser service called");
    const updateUser = await AdminRepository.updateUserById(
      targetUserId,
      { account_status: AccountStatus.ACTIVE },
      USER_PROJECTION
    );
    if (!updateUser) {
      throw new ApiError(404, "user not found or update failed");
    }
    return updateUser;
  },

  followUser: async (followerId: string, followingId: string) => {
    logger.debug({ followerId, followingId }, "followUser service called");

    if (followerId === followingId) {
      throw new ApiError(400, "You cannot follow yourself");
    }

    const userToFollow = await UserRepository.findUserById(followingId);
    if (!userToFollow) {
      throw new ApiError(404, "User to follow not found");
    }

    // Check if already following
    const follower = await UserRepository.findUserById(followerId);
    if (follower?.following?.includes(followingId as any)) {
      throw new ApiError(400, "You are already following this user");
    }

    await UserRepository.followUser(followerId, followingId);

    return { message: "User followed successfully" };
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    logger.debug({ followerId, followingId }, "unfollowUser service called");

    const userToUnfollow = await UserRepository.findUserById(followingId);
    if (!userToUnfollow) {
      throw new ApiError(404, "User to unfollow not found");
    }

    await UserRepository.unfollowUser(followerId, followingId);

    return { message: "User unfollowed successfully" };
  },

  getUserFollowers: async (userId: string, page: number, limit: number) => {
    logger.debug({ userId, page, limit }, "getUserFollowers service called");
    const skip = (page - 1) * limit;

    const followers = await UserRepository.getFollowers(userId, skip, limit);
    const totalFollowers = await UserRepository.countFollowers(userId);
    const totalPage = Math.ceil(totalFollowers / limit);

    return {
      followers,
      totalFollowers,
      totalPage,
      currentPage: page,
    };
  },

  getUserFollowing: async (userId: string, page: number, limit: number) => {
    logger.debug({ userId, page, limit }, "getUserFollowing service called");
    const skip = (page - 1) * limit;

    const following = await UserRepository.getFollowing(userId, skip, limit);
    const totalFollowing = await UserRepository.countFollowing(userId);
    const totalPage = Math.ceil(totalFollowing / limit);

    return {
      following,
      totalFollowing,
      totalPage,
      currentPage: page,
    };
  },
};

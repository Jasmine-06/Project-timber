import { CommunityRepository } from "../repositories/community.repository";
import { ApiError } from "../advices/ApiError";
import logger from "../utils/logger";
import { UserRepository } from "../repositories/user.repository";
import { MessageRepository } from "../repositories/message.repository";

export const CommunityService = {
  createCommunity: async (data: {
    name: string;
    description?: string;
    image?: string;
    avatar?: string;
    isPrivate?: boolean;
    owner: string;
  }) => {
    logger.debug({ data }, "createCommunity service called");
    const { name, description, image, avatar, isPrivate, owner } = data;

    const existingCommunity = await CommunityRepository.findCommunityByName(
      name
    );
    if (existingCommunity) {
      throw new ApiError(400, "Community with this name already exists");
    }

    const newCommunity = await CommunityRepository.createCommunity({
      name,
      description,
      image,
      avatar,
      isPrivate: isPrivate ?? false,
      owner: owner as any,
      // Owner is automatically added to admins and members via pre-save hook
    });

    if (!newCommunity) {
      throw new ApiError(500, "Failed to create community");
    }

    // Add community to owner's list
    await UserRepository.addCommunityToUser(owner, String(newCommunity._id));

    return newCommunity;
  },

  getAllCommunities: async (page: number, limit: number, search: string) => {
    logger.debug({ page, limit, search }, "getAllCommunities service called");
    const skip = (page - 1) * limit;

    const communities = await CommunityRepository.findAllCommunities(
      skip,
      limit,
      search
    );
    const totalCommunities = await CommunityRepository.countAllCommunities(
      search
    );
    const totalPage = Math.ceil(totalCommunities / limit);

    return {
      communities,
      totalCommunities,
      totalPage,
      currentPage: page,
    };
  },

  getCommunityById: async (id: string) => {
    logger.debug({ id }, "getCommunityById service called");
    const community = await CommunityRepository.findCommunityById(id);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }
    return community;
  },

  updateCommunity: async (
    id: string,
    userId: string,
    updateData: {
      name?: string;
      description?: string;
      image?: string;
      avatar?: string;
      isPrivate?: boolean;
    }
  ) => {
    logger.debug({ id, userId, updateData }, "updateCommunity service called");

    const community = await CommunityRepository.findCommunityById(id);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    // Only owner can update community details
    if (String((community.owner as any)._id) !== userId) {
      throw new ApiError(403, "Only owner can update community details");
    }

    const updatedCommunity = await CommunityRepository.updateCommunityById(
      id,
      updateData
    );
    return updatedCommunity;
  },

  joinCommunity: async (communityId: string, userId: string) => {
    logger.debug({ communityId, userId }, "joinCommunity service called");

    const community = await CommunityRepository.findCommunityById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    // Check if community is private
    if (community.isPrivate) {
      throw new ApiError(
        403,
        "This is a private community. Join requests are not currently supported."
      );
    }

    // Check if user is already a member
    if (community.members.some((member: any) => String(member._id) === userId)) {
      throw new ApiError(400, "User is already a member of this community");
    }

    await CommunityRepository.addMemberToCommunity(communityId, userId);

    // Update user's communities list
    await UserRepository.addCommunityToUser(userId, communityId);

    return { message: "Joined community successfully" };
  },

  leaveCommunity: async (communityId: string, userId: string) => {
    logger.debug({ communityId, userId }, "leaveCommunity service called");

    const community = await CommunityRepository.findCommunityById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    // Owner cannot leave the community
    if (String((community.owner as any)._id) === userId) {
      throw new ApiError(
        400,
        "Owner cannot leave the community. Delete the community or transfer ownership."
      );
    }

    // If user is an admin, remove from admins first
    if (community.admins.some((admin: any) => String(admin._id) === userId)) {
      await CommunityRepository.removeAdminFromCommunity(communityId, userId);
    }

    await CommunityRepository.removeMemberFromCommunity(communityId, userId);

    // Update user's communities list
    await UserRepository.removeCommunityFromUser(userId, communityId);

    return { message: "Left community successfully" };
  },

  deleteCommunity: async (communityId: string, userId: string) => {
    logger.debug({ communityId, userId }, "deleteCommunity service called");

    const community = await CommunityRepository.findCommunityById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    // Only owner can delete the community
    if (String((community.owner as any)._id) !== userId) {
      throw new ApiError(403, "Only owner can delete the community");
    }

    await CommunityRepository.deleteCommunityById(communityId);

    // Remove community from all users' lists
    await UserRepository.removeCommunityFromAllUsers(communityId);

    return { message: "Community deleted successfully" };
  },

  addAdmin: async (
    communityId: string,
    ownerId: string,
    targetUserId: string
  ) => {
    logger.debug(
      { communityId, ownerId, targetUserId },
      "addAdmin service called"
    );

    const community = await CommunityRepository.findCommunityById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    // Only owner can add admins
    if (String((community.owner as any)._id) !== ownerId) {
      throw new ApiError(403, "Only owner can add admins");
    }

    // Check if target user is a member
    const isMember = community.members.some(
      (member: any) => String(member._id) === targetUserId
    );
    if (!isMember) {
      throw new ApiError(400, "User must be a member to become an admin");
    }

    // Check if already an admin
    const isAlreadyAdmin = community.admins.some(
      (admin: any) => String(admin._id) === targetUserId
    );
    if (isAlreadyAdmin) {
      throw new ApiError(400, "User is already an admin");
    }

    await CommunityRepository.addAdminToCommunity(communityId, targetUserId);

    return { message: "Admin added successfully" };
  },

  removeAdmin: async (
    communityId: string,
    ownerId: string,
    targetUserId: string
  ) => {
    logger.debug(
      { communityId, ownerId, targetUserId },
      "removeAdmin service called"
    );

    const community = await CommunityRepository.findCommunityById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    // Only owner can remove admins
    if (String((community.owner as any)._id) !== ownerId) {
      throw new ApiError(403, "Only owner can remove admins");
    }

    // Cannot remove owner from admins
    if (String((community.owner as any)._id) === targetUserId) {
      throw new ApiError(400, "Cannot remove owner from admins");
    }

    // Check if user is an admin
    const isAdmin = community.admins.some(
      (admin: any) => String(admin._id) === targetUserId
    );
    if (!isAdmin) {
      throw new ApiError(400, "User is not an admin");
    }

    await CommunityRepository.removeAdminFromCommunity(
      communityId,
      targetUserId
    );

    return { message: "Admin removed successfully" };
  },

  getCommunitiesByUser: async (userId: string) => {
    logger.debug({ userId }, "getCommunitiesByUser service called");

    const communities = await CommunityRepository.findCommunitiesByMember(
      userId
    );

    return { communities };
  },

  getCommunityMessages: async (
    communityId: string,
    limit: number = 50,
    before?: string
  ) => {
    logger.debug(
      { communityId, limit, before },
      "getCommunityMessages service called"
    );

    const community = await CommunityRepository.findCommunityById(communityId);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    const messages = await MessageRepository.findMessagesByCommunity(
      communityId,
      limit,
      before
    );

    // Because MessageRepository now returns profile_picture, we might need to verify if frontend 
    // expects 'avatar' or 'profile_picture'. Ideally frontend matches backend. 
    // We will return as is.

    return messages;
  },
};

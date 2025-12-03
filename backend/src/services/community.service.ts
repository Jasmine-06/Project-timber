import { CommunityRepository } from "../repositories/community.repository";
import { ApiError } from "../advices/ApiError";
import logger from "../utils/logger";
import { UserRepository } from "../repositories/user.repository";

export const CommunityService = {
  createCommunity: async (data: {
    name: string;
    bio?: string;
    image?: string;
    admin_id: string;
  }) => {
    logger.debug({ data }, "createCommunity service called");
    const { name, bio, image, admin_id } = data;

    const existingCommunity = await CommunityRepository.findCommunityByName(
      name
    );
    if (existingCommunity) {
      throw new ApiError(400, "Community with this name already exists");
    }

    const newCommunity = await CommunityRepository.createCommunity({
      name,
      bio,
      image,
      admin_id: admin_id as any,
      users: [admin_id as any], // Admin is automatically a member
    });

    if (!newCommunity) {
      throw new ApiError(500, "Failed to create community");
    }

    // Add community to admin's list
    await UserRepository.addCommunityToUser(admin_id, String(newCommunity._id));

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
    updateData: { name?: string; bio?: string; image?: string }
  ) => {
    logger.debug({ id, userId, updateData }, "updateCommunity service called");

    const community = await CommunityRepository.findCommunityById(id);
    if (!community) {
      throw new ApiError(404, "Community not found");
    }

    if (String((community.admin_id as any)._id) !== userId) {
      throw new ApiError(403, "Only admin can update community details");
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

    // Check if user is already a member
    if (community.users.some((user: any) => String(user._id) === userId)) {
      throw new ApiError(400, "User is already a member of this community");
    }

    await CommunityRepository.addUserToCommunity(communityId, userId);

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

    if (String((community.admin_id as any)._id) === userId) {
      throw new ApiError(
        400,
        "Admin cannot leave the community. Delete the community or transfer ownership."
      );
    }

    await CommunityRepository.removeUserFromCommunity(communityId, userId);

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

    if (String((community.admin_id as any)._id) !== userId) {
      throw new ApiError(403, "Only admin can delete the community");
    }

    await CommunityRepository.deleteCommunityById(communityId);

    // Remove community from all users' lists
    await UserRepository.removeCommunityFromAllUsers(communityId);

    return { message: "Community deleted successfully" };
  },
};

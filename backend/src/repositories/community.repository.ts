import { Community, type ICommunity } from "../models/community.model";
import { Types } from "mongoose";

export const COMMUNITY_PROJECTION = {
  _id: 1,
  name: 1,
  description: 1,
  image: 1,
  avatar: 1,
  admins: 1,
  members: 1,
  isPrivate: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const CommunityRepository = {
  createCommunity: async (communityData: Partial<ICommunity>) => {
    const community = new Community(communityData);
    const savedCommunity = await community.save();

    // Populate admins and members with user details
    const populatedCommunity = await Community.findById(savedCommunity._id, COMMUNITY_PROJECTION)
      .populate("admins", "name username profile_picture")
      .populate("members", "name username profile_picture")
      .lean();

    // Remove __v field manually
    if (populatedCommunity) {
      delete (populatedCommunity as any).__v;
    }

    return populatedCommunity;
  },

  findCommunityById: async (
    id: string,
    projection: any = COMMUNITY_PROJECTION
  ) => {
    return await Community.findById(id, projection)
      .populate("admins", "name username profile_picture")
      .populate("members", "name username profile_picture");
  },

  findCommunityByName: async (name: string) => {
    return await Community.findOne({ name });
  },

  findAllCommunities: async (
    skip: number,
    limit: number,
    search: string = ""
  ) => {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    return await Community.find(query)
      .skip(skip)
      .limit(limit)
      .select(COMMUNITY_PROJECTION)
      .populate("admins", "name username profile_picture");
  },

  countAllCommunities: async (search: string = "") => {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    return await Community.countDocuments(query);
  },

  updateCommunityById: async (id: string, updateData: Partial<ICommunity>) => {
    return await Community.findByIdAndUpdate(id, updateData, {
      new: true,
      projection: COMMUNITY_PROJECTION,
    });
  },

  deleteCommunityById: async (id: string) => {
    return await Community.findByIdAndDelete(id);
  },

  addMemberToCommunity: async (communityId: string, userId: string) => {
    return await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { members: userId } },
      { new: true }
    );
  },

  removeMemberFromCommunity: async (communityId: string, userId: string) => {
    return await Community.findByIdAndUpdate(
      communityId,
      { $pull: { members: userId } },
      { new: true }
    );
  },

  addAdminToCommunity: async (communityId: string, userId: string) => {
    return await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { admins: userId } },
      { new: true }
    );
  },

  removeAdminFromCommunity: async (communityId: string, userId: string) => {
    return await Community.findByIdAndUpdate(
      communityId,
      { $pull: { admins: userId } },
      { new: true }
    );
  },

  findCommunitiesByMember: async (userId: string) => {
    return await Community.find({ members: userId })
      .select(COMMUNITY_PROJECTION)
      .populate("admins", "name username profile_picture");
  },

  findCommunitiesByOwner: async (userId: string) => {
    return await Community.find({ owner: userId })
      .select(COMMUNITY_PROJECTION)
      .populate("admins", "name username profile_picture");
  },

  isMember: async (communityId: string, userId: string): Promise<boolean> => {
    const community = await Community.findById(communityId).select("members");
    if (!community) return false;
    return community.members.some(
      (memberId) => memberId.toString() === userId
    );
  },

  isAdmin: async (communityId: string, userId: string): Promise<boolean> => {
    const community = await Community.findById(communityId).select("admins");
    if (!community) return false;
    return community.admins.some((adminId) => adminId.toString() === userId);
  },

  isOwner: async (communityId: string, userId: string): Promise<boolean> => {
    const community = await Community.findById(communityId).select("owner");
    if (!community) return false;
    return community.owner.toString() === userId;
  },
};

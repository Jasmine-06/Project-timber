import { Community, type ICommunity } from "../models/community.model";

export const COMMUNITY_PROJECTION = {
  _id: 1,
  name: 1,
  image: 1,
  bio: 1,
  admin_id: 1,
  users: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const CommunityRepository = {
  createCommunity: async (communityData: Partial<ICommunity>) => {
    const community = new Community(communityData);
    return await community.save();
  },

  findCommunityById: async (
    id: string,
    projection: any = COMMUNITY_PROJECTION
  ) => {
    return await Community.findById(id, projection)
      .populate("admin_id", "name username image")
      .populate("users", "name username image");
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
      .populate("admin_id", "name username image");
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

  addUserToCommunity: async (communityId: string, userId: string) => {
    return await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { users: userId } },
      { new: true }
    );
  },

  removeUserFromCommunity: async (communityId: string, userId: string) => {
    return await Community.findByIdAndUpdate(
      communityId,
      { $pull: { users: userId } },
      { new: true }
    );
  },
};

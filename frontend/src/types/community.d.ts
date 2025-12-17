interface ICommunity {
    _id: string;
    name: string;
    description: string;
    image: string;
    avatar: string | null;
    admins: IUser[];
    members: IUser[];
    isPrivate: boolean;
    memberCount?: number;
    createdAt: string;
    updatedAt: string;
}

interface ICreateCommunityData {
    name: string;
    description: string;
    avatar?: string;
    isPrivate?: boolean;
}

interface IUpdateCommunityData {
    name?: string;
    description?: string;
    avatar?: string;
    isPrivate?: boolean;
}

interface IGetCommunitiesResponse {
    communities: ICommunity[];
    totalCommunities: number;
    totalPage: number;
    currentPage: number;
}

interface IAddAdminData {
    userId: string;
}

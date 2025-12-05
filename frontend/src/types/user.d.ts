interface IPagination {
  totalUser: number;
  totalPage: number;
  currentPage: number;
  limit: number;
}

interface IGetAllUserResponse {
  data: IUser[];
  pagination: IPagination;
  message: string;
}

interface IGetFollowersResponse {
  data: IUser[];
  pagination: IPagination;
  message: string;
}

interface IGetFollowingResponse {
  data: IUser[];
  pagination: IPagination;
  message: string;
}

interface ISuspendedResponse {
  data: IUser;
  message: string;
}

interface IReactiveResponse {
  data: IUser;
  message: string;
}

interface IUserProfile extends IUser {
  bio?: string;
  profile_picture?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_following?: boolean;
  is_own_profile?: boolean;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

interface IUserProfile extends IUser {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  postsCount?: number;
}

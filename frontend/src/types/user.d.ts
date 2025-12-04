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

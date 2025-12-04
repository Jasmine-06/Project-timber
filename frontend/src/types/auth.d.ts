interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  roles: string[];
  account_status: string;
  is_verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IRegisterResponse {
  // for verify also
  user: IUser;
  message: string;
}

interface ILoginResponse {
  access_token: string;
  user: IUser;
  message: string;
}

interface IRefreshResponse {
  access_token: string;
  user: IUser;
}

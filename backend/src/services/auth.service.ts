import type { IUser } from "../models/user.models";
import type {
  IRegistrationSchema,
  IResendVerificationCode,
  IVerifySchema,
  ILoginSchema,
} from "../schema/user.schema";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../advices/ApiError";
import { hashedPasswords, comparePassword } from "../utils/bcrypt.utils";
import { generateOtp, generateTimeStamp } from "../utils/otp.utils";
import { SessionRepository } from "../repositories/session.repository";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";

export const AuthService = {
  RegisterUser: async (
    data: IRegistrationSchema
  ): Promise<{ user: IUser; status_code: number } | undefined> => {
    const { name, username, email, password } = data;
    const existingUserByEmail = await UserRepository.findUserByEmail(email);

    if (existingUserByEmail?.is_verified === true) {
      throw new ApiError(400, "User already exisit with the email");
    }

    const existingUserByUsername = await UserRepository.findUserByUserName(
      username,
      true
    );
    if (existingUserByUsername) {
      throw new ApiError(400, "This username is already taken");
    }

    const hashPassword = await hashedPasswords(password);
    const verification_code = generateOtp();
    const verification_code_expiry = generateTimeStamp("15");
    let userToBeReturn: IUser | null = null;
    let isExistingUser = false;

    if (existingUserByEmail) {
      userToBeReturn = await UserRepository.updateUserById(
        String(existingUserByEmail._id),
        {
          name,
          password: hashPassword,
          username,
          verification_code,
          verification_code_expiry,
          is_verified: false,
        },
        {
          _id: 1,
          name: 1,
          email: 1,
          username: 1, // it is a concept of projection the fied which include in db
          is_verified: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      );

      if (!userToBeReturn) {
        throw new ApiError(500, "Failed to update user");
      }

      isExistingUser = true;
    } else {
      // user doesn't exists (New Registration)
      const createdUser = await UserRepository.createUser(
        {
          name,
          email,
          username,
          password: hashPassword,
          verification_code_expiry,
          verification_code,
          is_verified: false,
        },
        {
          _id: 1,
          name: 1,
          email: 1,
          username: 1,
          is_verified: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      );

      if (!createdUser) {
        throw new ApiError(409, "Failed to create user");
      }

      userToBeReturn = createdUser;

      return {
        user: userToBeReturn,
        status_code: isExistingUser ? 200 : 201,
      };
    }
  },

  VerifyUser: async (data: IVerifySchema) => {
    const { email, verificationCode } = data;

    const user = await UserRepository.findUserByEmail(email);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.is_verified) {
      throw new ApiError(400, "User is already verified");
    }

    if (!user.verification_code || !user.verification_code_expiry) {
      throw new ApiError(
        400,
        "No verification code found, please suggest it again"
      );
    }

    if (user.verification_code !== verificationCode) {
      throw new ApiError(400, "Invalid verification code");
    }

    if (new Date() > user.verification_code_expiry) {
      throw new ApiError(
        400,
        "Verification code is expired...please register again"
      );
    }

    const verified_user = await UserRepository.updateUserById(
      String(user._id),
      {
        is_verified: true,
        verification_code: undefined,
        verification_code_expiry: undefined,
      },
      {
        _id: 1,
        name: 1,
        email: 1,
        username: 1,
        is_verified: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );

    if (!verified_user) {
      throw new ApiError(409, "failed to verify");
    }

    return verified_user;
  },

  ResendVerificationCode: async (data: IResendVerificationCode) => {},
  ForgotPassword: async () => {},
  ResetPassword: async () => {},

  LoginUser: async (data: ILoginSchema) => {
    const { email, password } = data;

    const savedUser = await UserRepository.findUserByEmail(email);
    if (!savedUser) {
      throw new ApiError(401, "Invallid credentials");
    }

    if (!savedUser.is_verified) {
      throw new ApiError(403, "Please verify your email to login");
    }

    const is_passwordValid = await comparePassword(
      password,
      savedUser.password
    );

    if (!is_passwordValid) {
      throw new ApiError(401, "Invalid Password!");
    }

    const userToBeReturn = await UserRepository.findUserById(
      String(savedUser._id),
      {
        _id: 1,
        name: 1,
        username: 1,
        is_verified: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );

    if (!userToBeReturn) {
      throw new ApiError(404, "User not found");
    }

    const access_token = generateAccessToken(userToBeReturn);
    const refresh_token = generateRefreshToken(userToBeReturn);

    const sessionExpiresAt = new Date();

    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 30);

    await SessionRepository.deleteSessionByUserId(String(userToBeReturn._id));

    //  create new session in db
    const session = await SessionRepository.createSession({
      user_id: String(userToBeReturn._id),
      refresh_token,
      expires_at: sessionExpiresAt,
    });

    if (!session) {
      throw new ApiError(500, "Failed to create session");
    }

    return {
      user: userToBeReturn,
      access_token,
      refresh_token,
    };
  },

  RefreshAccessToken: async (refresh_token: string) => {
    if (!refresh_token) {
      throw new ApiError(401, "Refresh token not provided");
    }

    const session = await SessionRepository.findSessionByToken(refresh_token);

    if (!session) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const userObj = await UserRepository.findUserById(String(session.userId), {
      _id: 1,
      name: 1,
      email: 1,
      username: 1,
      is_verified: 1,
      createdAt: 1,
      updatedAt: 1,
    });

    if (!userObj) {
      throw new ApiError(404, "User not found");
    }

    const access_token = generateAccessToken(userObj);

    return {
      access_token,
      user: userObj,
    };
  },

  LogoutUser: async (userId: string) => {
  },
};

import type { IUser } from "../models/user.models";
import type {
  IRegistrationSchema,
  IResendVerificationCode,
  IVerifySchema,
  ILoginSchema,
  ICheckVerificationSchema,
  IResetPasswordSchema,
  IForgotPasswordSchema,
} from "../schema/user.schema";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../advices/ApiError";
import { hashedPasswords, comparePassword } from "../utils/bcrypt.utils";
import { generateOtp, generateTimeStamp } from "../utils/otp.utils";
import { SessionRepository } from "../repositories/session.repository";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";
import { MailerService } from "../mails/mailer.service";

// Common projection for user responses
const USER_PROJECTION = {
  _id: 1,
  name: 1,
  email: 1,
  username: 1,
  is_verified: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const AuthService = {
  RegisterUser: async (
    data: IRegistrationSchema
  ): Promise<{ user: IUser; status_code: number }> => {
    const { name, username, email, password } = data;
    const existingUserByEmail = await UserRepository.findUserByEmail(email);

    if (existingUserByEmail?.is_verified === true) {
      throw new ApiError(400, "User already exists with this email");
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
    let statusCode = 201;

    if (existingUserByEmail) {
      // Update existing unverified user
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
        USER_PROJECTION
      );

      if (!userToBeReturn) {
        throw new ApiError(500, "Failed to update user");
      }

      statusCode = 200;
    } else {
      // Create new user
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
        USER_PROJECTION
      );

      if (!createdUser) {
        throw new ApiError(409, "Failed to create user");
      }

      userToBeReturn = createdUser;
    }

    await MailerService.SendVerificationCode(
      userToBeReturn.email,
      userToBeReturn.name,
      userToBeReturn.verification_code!
    );

    return {
      user: userToBeReturn,
      status_code: statusCode,
    };
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
        "No verification code found, please request it again"
      );
    }

    if (user.verification_code !== verificationCode) {
      throw new ApiError(400, "Invalid verification code");
    }

    if (new Date() > user.verification_code_expiry) {
      throw new ApiError(
        400,
        "Verification code is expired, please register again"
      );
    }

    const verified_user = await UserRepository.updateUserById(
      String(user._id),
      {
        is_verified: true,
        verification_code: undefined,
        verification_code_expiry: undefined,
      },
      USER_PROJECTION
    );

    if (!verified_user) {
      throw new ApiError(409, "Failed to verify user");
    }

    return verified_user;
  },

  LoginUser: async (data: ILoginSchema) => {
    const { email, password } = data;

    const savedUser = await UserRepository.findUserByEmail(email);
    if (!savedUser) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!savedUser.is_verified) {
      throw new ApiError(403, "Please verify your email to login");
    }

    const is_passwordValid = await comparePassword(
      password,
      savedUser.password
    );

    if (!is_passwordValid) {
      throw new ApiError(401, "Invalid password");
    }

    const userToBeReturn = await UserRepository.findUserById(
      String(savedUser._id),
      USER_PROJECTION
    );

    if (!userToBeReturn) {
      throw new ApiError(404, "User not found");
    }

    const access_token = generateAccessToken(userToBeReturn);
    const refresh_token = generateRefreshToken(userToBeReturn);

    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 30);

    await SessionRepository.deleteSessionByUserId(String(userToBeReturn._id));

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

    const userObj = await UserRepository.findUserById(
      String(session.userId),
      USER_PROJECTION
    );

    if (!userObj) {
      throw new ApiError(404, "User not found");
    }

    const access_token = generateAccessToken(userObj);

    return {
      access_token,
      user: userObj,
    };
  },

  ForgotPassword: async (data: IForgotPasswordSchema) => {
    const { email } = data;

    const existingUser = await UserRepository.findUserByEmail(email);
    if (!existingUser || !existingUser.is_verified) {
      throw new ApiError(404, "User not found with this email");
    }

    const verification_code = generateOtp();
    const verification_code_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await UserRepository.updateUserById(String(existingUser._id), {
      verification_code,
      verification_code_expiry,
    });

    await MailerService.SendPasswordResetEmail(email, existingUser.name, verification_code);

    return {
      message: "Verification code sent to your email",
    };
  },

  ResendVerificationCode: async (data: IResendVerificationCode) => {
    const { email } = data;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const user = await UserRepository.findUserByEmail(email);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.is_verified) {
      throw new ApiError(400, "User is already verified");
    }

    const verification_code = generateOtp();
    const verification_code_expiry = generateTimeStamp("15");

    const updatedUser = await UserRepository.updateUserById(
      String(user._id),
      {
        verification_code,
        verification_code_expiry,
      }
    );

    if (!updatedUser) {
      throw new ApiError(500, "Failed to generate new verification code");
    }

    await MailerService.SendVerificationCode(
      email,
      user.name,
      verification_code
    );

    return {
      message: "New verification code sent to your email",
    };
  },

  CheckVerificationCode: async (data: ICheckVerificationSchema) => {
    const { email, verificationCode } = data;

    const existingUser = await UserRepository.findUserByEmail(email);

    if (!existingUser) {
      throw new ApiError(404, "User not found with this email");
    }

    if (existingUser.verification_code !== verificationCode) {
      throw new ApiError(400, "Invalid verification code");
    }

    if (
      !existingUser.verification_code_expiry ||
      existingUser.verification_code_expiry.getTime() < Date.now()
    ) {
      throw new ApiError(400, "Verification code expired");
    }

    return {
      message: "Verification code is valid",
    };
  },

  ResetPassword: async (data: IResetPasswordSchema) => {
    const { email, verificationCode, newPassword } = data;

    const existingUser = await UserRepository.findUserByEmail(email);

    if (!existingUser) {
      throw new ApiError(404, "User not found with this email");
    }

    if (existingUser.verification_code !== verificationCode) {
      throw new ApiError(400, "Invalid verification code");
    }

    if (
      !existingUser.verification_code_expiry ||
      existingUser.verification_code_expiry.getTime() < Date.now()
    ) {
      throw new ApiError(400, "Verification code expired");
    }

    const hashedPassword = await hashedPasswords(newPassword);

    await UserRepository.updateUserById(String(existingUser._id), {
      password: hashedPassword,
      verification_code: undefined,
      verification_code_expiry: undefined,
    });

    return {
      message: "Password reset successful",
    };
  },

  LogoutUser: async (refreshToken: string) => {
    if (refreshToken) {
      const session = await SessionRepository.findSessionByToken(refreshToken);

      if (session) {
        await SessionRepository.deleteSessionById(String(session._id));
      }
    }

    return {
      message: "Logged out successfully",
    };
  },
};

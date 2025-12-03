import { ApiError } from "../advices/ApiError";
import {
  CheckVerificationSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegistrationSchema,
  ResendVerificationCode,
  ResetPasswordSchema,
  VerifySchema,
} from "../schema/user.schema";
import asyncHandler from "../utils/asyncHandler";
import { zodErrorFormatter } from "../utils/error.formatter";
import { ApiResponse } from "../advices/ApiResponse";
import { AuthService } from "../services/auth.service";
import logger from "../utils/logger";

// Helper function to set auth cookies
const setAuthCookies = (
  res: any,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 min
  });
};

// Register Controller - Handles registration request/response
const RegisterController = asyncHandler(async (req, res) => {
  logger.debug({ body: req.body }, "RegisterController request");
  const result = RegistrationSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const data = await AuthService.RegisterUser(result.data);
  logger.info({ userEmail: data.user.email }, "User registered successfully");

  res.status(data.status_code).json(
    new ApiResponse({
      user: data.user,
      message:
        "User registered successfully. Please check your email for verification code",
    })
  );
});

// Login Controller - Handles login request/response
const LoginController = asyncHandler(async (req, res) => {
  logger.debug({ email: req.body.email }, "LoginController request");
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const data = await AuthService.LoginUser(result.data);
  logger.info({ userEmail: data.user.email }, "User logged in successfully");

  setAuthCookies(res, data.access_token, data.refresh_token);

  res.status(200).json(
    new ApiResponse({
      access_token: data.access_token,
      user: data.user,
      message: "User LoggedIn Successfully!",
    })
  );
});

// Refresh Access Token - Handles token refresh request/response
const RefreshAccessToken = asyncHandler(async (req, res) => {
  logger.debug("RefreshAccessToken request");
  const refresh_token = req.cookies.refresh_token;

  const data = await AuthService.RefreshAccessToken(refresh_token);

  res.cookie("access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 min
  });

  res.status(200).json(
    new ApiResponse({
      access_token: data.access_token,
      user: data.user,
    })
  );
});

// Verify User - Handles email verification request/response
const VerifyUser = asyncHandler(async (req, res) => {
  logger.debug({ body: req.body }, "VerifyUser request");
  const result = VerifySchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const verified_user = await AuthService.VerifyUser(result.data);

  res.status(200).json(
    new ApiResponse({
      user: verified_user,
      message: "User verified successfully",
    })
  );
});

// Forgot Password - Handles forgot password request/response
const ForgotPasswordController = asyncHandler(async (req, res) => {
  logger.debug({ body: req.body }, "ForgotPasswordController request");
  const result = ForgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const data = await AuthService.ForgotPassword(result.data);

  res.status(200).json(new ApiResponse(data));
});

// Resend Verification Code - Handles resend verification request/response
const ResendVerification = asyncHandler(async (req, res) => {
  logger.debug({ body: req.body }, "ResendVerification request");
  const result = ResendVerificationCode.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const data = await AuthService.ResendVerificationCode(result.data);

  res.status(200).json(new ApiResponse(data));
});

// Check Verification Code - Handles verification code validation request/response
const CheckVerificationCodeController = asyncHandler(async (req, res) => {
  logger.debug({ body: req.body }, "CheckVerificationCodeController request");
  const result = CheckVerificationSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const data = await AuthService.CheckVerificationCode(result.data);

  res.status(200).json(new ApiResponse(data));
});

// Reset Password - Handles password reset request/response
const ResetPasswordController = asyncHandler(async (req, res) => {
  logger.debug({ email: req.body.email }, "ResetPasswordController request");
  const result = ResetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const data = await AuthService.ResetPassword(result.data);

  res.status(200).json(new ApiResponse(data));
});

// Logout User - Handles logout request/response
const LogoutUser = asyncHandler(async (req, res) => {
  logger.debug("LogoutUser request");
  const refresh_token = req.cookies.refresh_token;

  await AuthService.LogoutUser(refresh_token);

  res.clearCookie("refresh_token");
  res.clearCookie("access_token");

  res.status(200).json(
    new ApiResponse({
      message: "Logged out successfully",
    })
  );
});

export {
  RegisterController,
  LoginController,
  RefreshAccessToken,
  VerifyUser,
  ForgotPasswordController,
  ResendVerification,
  CheckVerificationCodeController,
  ResetPasswordController,
  LogoutUser,
};

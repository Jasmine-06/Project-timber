import { ApiError } from "../advices/ApiError";
import {
  LoginSchema,
  RegistrationSchema,
  VerifySchema,
} from "../schema/user.schema";
import asyncHandler from "../utils/asyncHandler";
import { zodErrorFormatter } from "../utils/error.formatter";
import { ApiResponse } from "../advices/ApiResponse";
import { AuthService } from "../services/auth.service";

const RegisterController = asyncHandler(async (req, res) => {
  const result = RegistrationSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const data = await AuthService.RegisterUser(result.data);

  res.status(data?.status_code ? 200 : 201).json(
    new ApiResponse({
      user: data?.user,
      message:
        "User registered successfully. Please check your email for verification code ",
    })
  );
});

const LoginController = asyncHandler(async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      "Validation Error",
      zodErrorFormatter(result.error)
    );
  }

  const { access_token, refresh_token, user } = await AuthService.LoginUser(
    result.data
  );

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 min
  });

  res.status(200).json(
    new ApiResponse({
      access_token,
      user,
    })
  );
});

const RefreshAccessToken = asyncHandler(async (req, res) => {
  const refresh_token = req.cookies.refresh_token;

  const { access_token, user } = await AuthService.RefreshAccessToken(
    refresh_token
  );

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 min
  });

  res.status(200).json(
    new ApiResponse({
      access_token,
      user,
    })
  );
});

const VerifyUser = asyncHandler(async (req, res) => {
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
      message: "User verified successfully",
      user: verified_user,
    })
  );
});

const ResendVerificationCode = asyncHandler(async (req, res) => {
    
})

const ForgotPassword = asyncHandler(async (req, res) => {
    
})

const ResetPassword = asyncHandler(async (req, res) => {
    
})


export {
    RegisterController,
    LoginController,
    RefreshAccessToken,
    VerifyUser
}
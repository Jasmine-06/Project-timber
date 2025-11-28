import { Router } from "express";
import {
  RegisterController,
  LoginController,
  RefreshAccessToken,
  VerifyUser,
  ResendVerification,
  CheckVerificationCodeController,
  ResetPasswordController,
  LogoutUser
} from "../controllers/auth.controller";

const authRouter = Router();

// Public routes
authRouter.post("/register", RegisterController);
authRouter.post("/login", LoginController);
authRouter.post("/verify", VerifyUser);
authRouter.post("/resend-verification", ResendVerification);
authRouter.post("/check-verification-code", CheckVerificationCodeController);
authRouter.post("/reset-password", ResetPasswordController);

// Token refresh route
authRouter.post("/refresh-token", RefreshAccessToken);

// Protected routes (logout requires authentication)
authRouter.post("/logout", LogoutUser);

export default authRouter;

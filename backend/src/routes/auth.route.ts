import { Router } from "express";
import {
  RegisterController,
  LoginController,
  RefreshAccessToken,
  VerifyUser,
  ResendVerification,
  CheckVerificationCodeController,
  ResetPasswordController,
  LogoutUser,
  ForgotPasswordController
} from "../controllers/auth.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";
import { GetAllUserController, ReactiveUserController, SuspendedUserController } from "../controllers/admin.controller";

const authRouter = Router();

// Public routes
authRouter.post("/register", RegisterController);
authRouter.post("/login", LoginController);
authRouter.post("/verify", VerifyUser);
authRouter.post("/resend-verification", ResendVerification);
authRouter.post("/forgot", ForgotPasswordController);
authRouter.post("/check-verification-code", CheckVerificationCodeController);
authRouter.post("/reset-password", ResetPasswordController);

// Token refresh route
authRouter.post("/refresh-token", RefreshAccessToken);

// Protected routes (logout requires authentication)
authRouter.post("/logout", LogoutUser);




authRouter.use(AuthMiddleware);
authRouter.use(isAdmin);

authRouter.get("/", GetAllUserController);
authRouter.patch("/:userId/suspend", SuspendedUserController);
authRouter.patch("/:userId/reactive", ReactiveUserController);



export default authRouter;

import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { meController } from "../controllers/user.controller";

const userRouter = Router();

userRouter.use(AuthMiddleware);

userRouter.get("/me", meController);

export default userRouter;
import { Router } from "express";
import { GetAllUserController, ReactiveUserController, SuspendedUserController } from "../controllers/admin.controller";
import { isAdmin } from "../middlewares/role.middleware";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const adminRouter = Router();

adminRouter.use(AuthMiddleware);
adminRouter.use(isAdmin);

adminRouter.get("/", GetAllUserController);
adminRouter.patch("/:userId/suspend", SuspendedUserController);
adminRouter.patch("/:userId/reactive", ReactiveUserController);

export default adminRouter;

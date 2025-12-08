import { Router, type RequestHandler } from "express";
import { upload } from "../middlewares/upload.middleware";
import { uploadMedia } from "../controllers/upload.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(AuthMiddleware)

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  uploadMedia
);

export default router;

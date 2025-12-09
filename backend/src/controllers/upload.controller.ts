import type { Request, Response, NextFunction } from "express";
import { CloudinaryUploader } from "../utils/cloudinary.config";
import logger from "../utils/logger";
import { ApiResponse } from "../advices/ApiResponse";

export const uploadMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.debug("uploadMedia request");
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || Object.keys(files).length === 0) {
      res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
      logger.warn("No files uploaded in uploadMedia");
      return;
    }

    const imageFiles = files["images"] || [];
    const videoFiles = files["videos"] || [];

    const imageUploads =
      imageFiles.length > 0
        ? await CloudinaryUploader.uploadMultipleImages(
            imageFiles.map((f) => f.buffer)
          )
        : [];

    const videoUploads =
      videoFiles.length > 0
        ? await CloudinaryUploader.uploadMultipleVideos(
            videoFiles.map((f) => f.buffer)
          )
        : [];

    res.status(200).json(
      new ApiResponse({
        data: {
          images: imageUploads,
          videos: videoUploads,
        },
        message: "Files uploaded successfully",
      })
    );
    logger.info(
      { imageCount: imageUploads.length, videoCount: videoUploads.length },
      "Files uploaded successfully"
    );
  } catch (error) {
    logger.error(error, "Error in uploadMedia");
    next(error);
  }
};

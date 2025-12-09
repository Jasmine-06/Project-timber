import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import logger from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


const uploadBuffer = async (
  buffer: Buffer,
  folder: string,
  resource_type: "image" | "video"
): Promise<UploadApiResponse> => {
  logger.debug({ folder, resource_type }, "Starting Cloudinary signed upload");

  // Convert buffer to base64 data URI
  const base64 = buffer.toString('base64');
  const mimeType = resource_type === "image" ? "image/jpeg" : "video/mp4";
  const dataURI = `data:${mimeType};base64,${base64}`;

  // For signed uploads, only include upload parameters
  const uploadOptions: any = {
    folder,
    resource_type,
  };

  // Only add format for images
  if (resource_type === "image") {
    uploadOptions.format = "webp";
    uploadOptions.quality = "auto";
  }

  try {
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    logger.debug(
      { public_id: result.public_id },
      "Cloudinary upload successful"
    );
    return result;
  } catch (error) {
    logger.error(error, "Cloudinary upload failed");
    throw error;
  }
};

export const CloudinaryUploader = {
  uploadImage: async (fileBuffer: Buffer) => {
    return uploadBuffer(fileBuffer, "images", "image");
  },

  uploadVideo: async (fileBuffer: Buffer) => {
    return uploadBuffer(fileBuffer, "videos", "video");
  },

  uploadMultipleImages: async (fileBuffers: Buffer[]) => {
    return Promise.all(
      fileBuffers.map((buffer) => uploadBuffer(buffer, "images", "image"))
    );
  },

  uploadMultipleVideos: async (fileBuffers: Buffer[]) => {
    return Promise.all(
      fileBuffers.map((buffer) => uploadBuffer(buffer, "videos", "video"))
    );
  },
};

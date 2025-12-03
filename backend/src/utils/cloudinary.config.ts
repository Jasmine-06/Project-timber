import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import logger from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadStream = (
  buffer: Buffer,
  folder: string,
  resource_type: "image" | "video"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    logger.debug({ folder, resource_type }, "Starting Cloudinary upload");
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resource_type,
        format: resource_type === "image" ? "webp" : "mp4",
        quality: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error(error, "Cloudinary upload failed");
          return reject(error);
        }
        if (result) {
          logger.debug(
            { public_id: result.public_id },
            "Cloudinary upload successful"
          );
          return resolve(result);
        }
        reject(new Error("Unknown error during upload"));
      }
    );
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(stream);
  });
};

export const CloudinaryUploader = {
  uploadImage: async (fileBuffer: Buffer) => {
    return uploadStream(fileBuffer, "images", "image");
  },
  uploadVideo: async (fileBuffer: Buffer) => {
    return uploadStream(fileBuffer, "videos", "video");
  },
  uploadMultipleImages: async (fileBuffers: Buffer[]) => {
    return Promise.all(
      fileBuffers.map((buffer) => uploadStream(buffer, "images", "image"))
    );
  },
  uploadMultipleVideos: async (fileBuffers: Buffer[]) => {
    return Promise.all(
      fileBuffers.map((buffer) => uploadStream(buffer, "videos", "video"))
    );
  },
};

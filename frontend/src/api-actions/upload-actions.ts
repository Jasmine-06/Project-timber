import axiosInstance from "@/lib/axios-interceptor";

export const UploadActions = {
  // Upload media
  UploadMediaAction: async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<{ images: string[]; videos: string[] }> => {
    const response = await axiosInstance.post<
      ApiResponse<{
        data: {
          images: { secure_url: string }[];
          videos: { secure_url: string }[];
        };
        message: string;
      }>
    >("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    // Map the response to extract secure_url strings
    const result = response.data.data!.data;
    return {
      images: result.images.map((img: any) => img.secure_url),
      videos: result.videos.map((vid: any) => vid.secure_url),
    };
  },
};

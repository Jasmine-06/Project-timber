import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UploadActions } from '@/api-actions/upload-actions';
import { AxiosError } from 'axios';

/**
 * Custom hook for uploading media files using TanStack Query
 * Handles file upload with progress tracking and error handling
 */
export const useUploadMedia = () => {
  return useMutation({
    mutationFn: ({ 
      formData, 
      onProgress 
    }: { 
      formData: FormData; 
      onProgress?: (progress: number) => void 
    }) => UploadActions.UploadMediaAction(formData, onProgress),
    onSuccess: (data) => {
      // Success notification is handled by the component
      console.log('Upload successful:', data);
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.apiError?.message || 'Failed to upload images. Please try again.';
      
      toast.error('Upload Failed', {
        description: errorMessage,
      });

      console.error('Upload error:', error);
    },
  });
};

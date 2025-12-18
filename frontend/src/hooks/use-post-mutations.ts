import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostActions } from '@/api-actions/post-action';
import { IUpdatePostSchema } from '@/schema/post.schema';
import { toast } from 'sonner';

export const useUpdatePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: IUpdatePostSchema }) =>
            PostActions.UpdatePostAction(postId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post', data._id] });
            toast.success('Post updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update post');
        },
    });
};

export const useDeletePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => PostActions.DeletePostAction(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Post deleted');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete post');
        },
    });
};

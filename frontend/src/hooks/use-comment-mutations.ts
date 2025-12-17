import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostActions } from '@/api-actions/post-action';
import { ICreateCommentSchema, IUpdateCommentSchema } from '@/schema/post.schema';
import { toast } from 'sonner';

export const useCreateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateCommentSchema) => PostActions.CreateCommentAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.post_id] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.post_id] }); // Update comment count in post
      toast.success('Comment added');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });
};

export const useUpdateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: IUpdateCommentSchema }) =>
      PostActions.UpdateCommentAction(commentId, data),
    onSuccess: (data) => {
        // We might not have post_id here directly from the response depending on what UpdateCommentAction returns, 
        // but typically we want to invalidate the comments list.
        // The backend returns the updated comment which has post_id.
      queryClient.invalidateQueries({ queryKey: ['post-comments', data.post_id] });
      toast.success('Comment updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    },
  });
};

export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => PostActions.DeleteCommentAction(commentId),
    onSuccess: (_, commentId) => {
        // We need post_id to invalidate comments. 
        // Since we don't have it easily here without passing it, we might invalidate all 'post-comments'.
        // Better: Pass postId as context or refetch all.
        // For now, let's invalidate all 'post-comments' queries which is a bit aggressive but safe,
        // OR rely on the component to refetch/invalidate if we pass postId to the mutation wrapper.
        // Actually, we can just invalidate 'post-comments'.
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      // We also want to update the post's comment count, effectively 'post' queries.
      queryClient.invalidateQueries({ queryKey: ['post'] });
      toast.success('Comment deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    },
  });
};

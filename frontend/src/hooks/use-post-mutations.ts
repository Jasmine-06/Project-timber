import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostActions } from "@/api-actions/post-action";
import { IUpdatePostSchema } from "@/schema/post.schema";
import { toast } from "sonner";

export const useUpdatePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: IUpdatePostSchema }) =>
            PostActions.UpdatePostAction(postId, data),
        onSuccess: (updatedPost) => {
            queryClient.setQueryData(["posts"], (oldPosts: IPost[] | undefined) => {
                if (!oldPosts) return [updatedPost];
                return oldPosts.map((post) =>
                    post._id === updatedPost._id ? updatedPost : post
                );
            });
            queryClient.invalidateQueries({ queryKey: ["post", updatedPost._id] });
            toast.success("Post updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update post");
        },
    });
};

export const useDeletePostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => PostActions.DeletePostAction(postId),
        onSuccess: (_, postId) => {
            queryClient.setQueryData(["posts"], (oldPosts: IPost[] | undefined) => {
                if (!oldPosts) return [];
                return oldPosts.filter((post) => post._id !== postId);
            });
            queryClient.invalidateQueries({ queryKey: ["posts"], refetchType: "active" });
            queryClient.invalidateQueries({ queryKey: ["userPosts"], refetchType: "active" });
            toast.success("Post deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete post");
        },
    });
};

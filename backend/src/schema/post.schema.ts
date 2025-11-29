import { z } from "zod";

const CreatePostSchema = z.object({
    caption: z.string().max(2000, "Caption must be less than 2000 characters").optional(),
    images: z.array(z.string().url("Invalid image URL")).optional(),
});

const UpdatePostSchema = z.object({
    caption: z.string().max(2000, "Caption must be less than 2000 characters").optional(),
    images: z.array(z.string().url("Invalid image URL")).optional(),
});

const CreateCommentSchema = z.object({
    post_id: z.string().min(1, "Post ID is required"),
    content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
    parent_id: z.string().optional(),
});

const UpdateCommentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
});

const LikePostSchema = z.object({
    post_id: z.string().min(1, "Post ID is required"),
});

const BookmarkPostSchema = z.object({
    post_id: z.string().min(1, "Post ID is required"),
});

type ICreatePostSchema = z.infer<typeof CreatePostSchema>;
type IUpdatePostSchema = z.infer<typeof UpdatePostSchema>;
type ICreateCommentSchema = z.infer<typeof CreateCommentSchema>;
type IUpdateCommentSchema = z.infer<typeof UpdateCommentSchema>;
type ILikePostSchema = z.infer<typeof LikePostSchema>;
type IBookmarkPostSchema = z.infer<typeof BookmarkPostSchema>;

export {
    CreatePostSchema,
    UpdatePostSchema,
    CreateCommentSchema,
    UpdateCommentSchema,
    LikePostSchema,
    BookmarkPostSchema,
};

export type {
    ICreatePostSchema,
    IUpdatePostSchema,
    ICreateCommentSchema,
    IUpdateCommentSchema,
    ILikePostSchema,
    IBookmarkPostSchema,
};

import { z } from "zod";

const CreateCommunitySchema = z.object({
    name: z.string().min(1, "Community name is required").max(100, "Name must be less than 100 characters"),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    image: z.string().url("Invalid image URL").optional(),
});

const UpdateCommunitySchema = z.object({
    name: z.string().min(1, "Community name is required").max(100, "Name must be less than 100 characters").optional(),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    image: z.string().url("Invalid image URL").optional(),
});

const AddUserToCommunitySchema = z.object({
    community_id: z.string().min(1, "Community ID is required"),
    user_id: z.string().min(1, "User ID is required"),
});

type ICreateCommunitySchema = z.infer<typeof CreateCommunitySchema>;
type IUpdateCommunitySchema = z.infer<typeof UpdateCommunitySchema>;
type IAddUserToCommunitySchema = z.infer<typeof AddUserToCommunitySchema>;

export {
    CreateCommunitySchema,
    UpdateCommunitySchema,
    AddUserToCommunitySchema,
};

export type {
    ICreateCommunitySchema,
    IUpdateCommunitySchema,
    IAddUserToCommunitySchema,
};

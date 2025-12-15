import { z } from "zod";

const createCommunitySchema = z.object({
  name: z
    .string()
    .min(3, "Community name must be at least 3 characters")
    .max(50, "Community name must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_\s-]+$/,
      "Community name can only contain letters, numbers, spaces, underscores, and hyphens"
    ),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
  avatar: z.string().url("Invalid avatar URL").optional(),
  isPrivate: z.boolean().default(false),
});

const updateCommunitySchema = z.object({
  name: z
    .string()
    .min(3, "Community name must be at least 3 characters")
    .max(50, "Community name must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_\s-]+$/,
      "Community name can only contain letters, numbers, spaces, underscores, and hyphens"
    )
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters")
    .optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  isPrivate: z.boolean().optional(),
});

const joinCommunitySchema = z.object({
  communityId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid community ID"),
});

const GetCommunityQuerySchema = z.object({
  page: z.string().default("1").transform(Number),
  limit: z.string().default("10").transform(Number),
  search: z.string().default(""),
});

const AddAdminSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});


type ICreateCommunitySchema = z.infer<typeof createCommunitySchema>;
type IUpdateCommunitySchema = z.infer<typeof updateCommunitySchema>;
type IJoinCommunitySchema = z.infer<typeof joinCommunitySchema>;
type IGetCommunityQuerySchema = z.infer<typeof GetCommunityQuerySchema>;
type IAddAdminSchema = z.infer<typeof AddAdminSchema>;

export {
    createCommunitySchema,
    updateCommunitySchema,
    joinCommunitySchema,
    GetCommunityQuerySchema,
    AddAdminSchema,
};

export type {
    ICreateCommunitySchema,
    IUpdateCommunitySchema,
    IJoinCommunitySchema,
    IGetCommunityQuerySchema,
    IAddAdminSchema,
};

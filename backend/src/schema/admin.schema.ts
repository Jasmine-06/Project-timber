import { z } from "zod";

const GetUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

const UserIdSchema = z.object({
    userId: z.string().optional(),
})

type IGetUserQuerySchema = z.infer<typeof GetUserQuerySchema>; 
type IUserIdSchema = z.infer<typeof UserIdSchema>; 

export {
    GetUserQuerySchema,
    UserIdSchema
}

export type {
    IGetUserQuerySchema,
    IUserIdSchema
}


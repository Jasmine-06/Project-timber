import mongoose, { Schema, type InferSchemaType } from "mongoose";

export enum UserRole {
    USER = "user",
    ADMIN = "admin"
}

export enum AccountStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    DELETED = "deleted"
}

export interface IUserCreateSchema {
    name: string,
    username: string,
    email: string,
    password: string,
    roles: UserRole[],
    account_status: AccountStatus,
    verification_code?: string,
    verification_code_expiry?: Date,
    is_verified?: boolean,
    bio?: string,
    interests?: string[],
    communities?: Schema.Types.ObjectId[],
};

const userSchema = new Schema<IUserCreateSchema>(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        roles: {
            type: [String],
            enum: Object.values(UserRole),
            default: [UserRole.USER],
        },
        account_status: {
            type: String,
            enum: Object.values(AccountStatus),
            default: AccountStatus.ACTIVE,
        },
        verification_code: {
            type: String,
            default: null,
        },
        verification_code_expiry: {
            type: Date,
            default: null,
        },
        is_verified: {
            type: Boolean,
            default: false,
        },
        bio: {
            type: String,
            default: "",
        },
        interests: {
            type: [String],
            default: [],
        },
        communities: {
            type: [Schema.Types.ObjectId],
            ref: "Community",
            default: [],
        },

}, 
{ timestamps: true });

export const User = mongoose.model<IUserCreateSchema>("User", userSchema);

export type IUser = InferSchemaType<typeof userSchema>;
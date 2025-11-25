import mongoose, { Schema } from "mongoose";


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

}, 
{ timestamps: true });

export const User = mongoose.model<IUserCreateSchema>("User", userSchema);
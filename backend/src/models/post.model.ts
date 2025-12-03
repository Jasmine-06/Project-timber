import { model, Schema } from "mongoose";

export interface IPost {
    user_id: Schema.Types.ObjectId;
    images: string[];
    videos: string[];
    caption?: string;
}

const postSchema = new Schema<IPost>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        images: {
            type: [String],
            default: [],
        },
        videos: {
            type: [String],
            default: [],
        },
        caption: {
            type: String,
            default: "",
            maxlength: 2000,
        },
    },
    { timestamps: true }
);

// Index for faster queries by user
postSchema.index({ user_id: 1, createdAt: -1 });

export const Post = model<IPost>("Post", postSchema);

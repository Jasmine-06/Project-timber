import { model, Schema } from "mongoose";

export interface IPostLike {
    post_id: Schema.Types.ObjectId;
    user_id: Schema.Types.ObjectId;
    liked_at: Date;
}

const postLikeSchema = new Schema<IPostLike>(
    {
        post_id: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        liked_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

// Compound unique index to prevent duplicate likes
postLikeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

export const PostLike = model<IPostLike>("PostLike", postLikeSchema);

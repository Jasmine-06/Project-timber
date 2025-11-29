import { model, Schema } from "mongoose";

export interface IPostBookmark {
    post_id: Schema.Types.ObjectId;
    user_id: Schema.Types.ObjectId;
    saved_at: Date;
}

const postBookmarkSchema = new Schema<IPostBookmark>(
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
        saved_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

// Compound unique index to prevent duplicate bookmarks
postBookmarkSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

export const PostBookmark = model<IPostBookmark>("PostBookmark", postBookmarkSchema);

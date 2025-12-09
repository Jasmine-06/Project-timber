import { model, Schema, Types } from "mongoose";

export interface IPostComment {
  post_id: Types.ObjectId;
  user_id: Types.ObjectId;
  parent_id?: Types.ObjectId;
  content: string;
}

const postCommentSchema = new Schema<IPostComment>(
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
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: "PostComment",
      default: null,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Index for faster queries by post
postCommentSchema.index({ post_id: 1, createdAt: -1 });
// Index for nested comments
postCommentSchema.index({ parent_id: 1 });

export const PostComment = model<IPostComment>(
  "PostComment",
  postCommentSchema
);

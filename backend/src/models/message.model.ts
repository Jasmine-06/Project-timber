import mongoose, { Schema, Document, Types, type InferSchemaType } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  SYSTEM = "system",
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  content: string;
  type: MessageType;
  sender: Types.ObjectId;
  community: Types.ObjectId;
  replyTo?: Types.ObjectId;
  isEdited: boolean;
  isDeleted: boolean;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient message queries
messageSchema.index({ community: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);

export type IMessageSchema = InferSchemaType<typeof messageSchema>;
// export const Community = model<ICommunity>("Community", communitySchema);
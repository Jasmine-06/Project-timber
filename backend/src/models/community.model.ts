import { model, Schema } from "mongoose";

export interface ICommunity {
    image?: string;
    name: string;
    admin_id: Schema.Types.ObjectId;
    users: Schema.Types.ObjectId[];
    bio?: string;
}

const communitySchema = new Schema<ICommunity>(
    {
        image: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        admin_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        users: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
        bio: {
            type: String,
            default: "",
            maxlength: 500,
        },
    },
    { timestamps: true }
);

export const Community = model<ICommunity>("Community", communitySchema);

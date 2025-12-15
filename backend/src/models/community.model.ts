import { model, Schema, Types, type InferSchemaType } from "mongoose";

export interface ICommunitySchema {
    _id: Types.ObjectId;
    image: string;
    name: string;
    description: string;
    avatar?: string;
    owner: Types.ObjectId;
    admins: Types.ObjectId[];
    members: Types.ObjectId[];
    isPrivate: boolean;
}

const communitySchema = new Schema<ICommunitySchema>(
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
        description: {
            type: String,
            required: true,
            maxlength: 500,
        },
        avatar: {
            type: String,
            default: null,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isPrivate: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Add owner to admins and members on creation
communitySchema.pre("save", function () {
    if (this.isNew) {
        if (!this.admins.includes(this.owner)) {
            this.admins.push(this.owner);
        }
        if (!this.members.includes(this.owner)) {
            this.members.push(this.owner);
        }
    }
});


export const Community = model<ICommunity>("Community", communitySchema);

export type ICommunity = InferSchemaType<typeof communitySchema>;
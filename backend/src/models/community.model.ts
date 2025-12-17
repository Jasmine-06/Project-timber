import { model, Schema, Types, type InferSchemaType } from "mongoose";

const communitySchema = new Schema(
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

// Virtual for member count
communitySchema.virtual("memberCount").get(function () {
    return this.members?.length || 0;
});

// Ensure virtuals are included in JSON
communitySchema.set("toJSON", { virtuals: true });
communitySchema.set("toObject", { virtuals: true });

export const Community = model("Community", communitySchema);

export type ICommunity = InferSchemaType<typeof communitySchema>;
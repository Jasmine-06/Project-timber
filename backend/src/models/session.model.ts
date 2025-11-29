import { model, Schema } from "mongoose";


interface ISession{
    user_id: Schema.Types.ObjectId
    refresh_token: string
    expires_at: Date
}

const sessionSchema = new Schema<ISession> ({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    refresh_token: {
        type: String,
        required: true,
        unique: true
    },
    expires_at: {
        type: Date,
        required: true
    },
})

export const Session = model<ISession> ("Session", sessionSchema);
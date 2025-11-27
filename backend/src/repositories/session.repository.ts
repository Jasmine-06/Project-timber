import type { Schema } from "mongoose";
import { Session } from "../models/session.model";

interface ISessionCreateSchema {
    user_id: Schema.Types.ObjectId | string;
    refresh_token: string;
    expires_at: Date;
}

export const SessionRepository = {

    createSession: async (sessionData: ISessionCreateSchema, projection?: any) => {
        const session = new Session(sessionData);
        const newSession = await session.save();
        if (projection) {
            return await Session.findById(newSession._id, projection);
        }
        return newSession;
    },

    findSessionByToken: async (refresh_token: string, projection?: any) => {
        const session = await Session.findOne(
            { refresh_token },
            projection
        );
        return session;
    },

    findSessionByUserId: async (user_id: string, projection?: any) => {
        const session = await Session.findOne(
            { user_id },
            projection
        );
        return session;
    },

    findSessionById: async (id: string, projection?: any) => {
        const session = await Session.findById(
            id,
            projection
        );
        return session;
    },

    updateSessionById: async (
        id: string,
        updateData: Partial<ISessionCreateSchema>,
        projection?: any
    ) => {
        const updatedSession = await Session.findByIdAndUpdate(
            id,
            updateData,
            { new: true, projection }
        );
        return updatedSession;
    },

    updateSessionByUserId: async (
        user_id: string,
        updateData: Partial<ISessionCreateSchema>,
        projection?: any
    ) => {
        const updatedSession = await Session.findOneAndUpdate(
            { user_id },
            updateData,
            { new: true, projection }
        );
        return updatedSession;
    },

    deleteSessionById: async (id: string): Promise<Boolean> => {
        const deletedSession = await Session.findByIdAndDelete(id);
        return !!deletedSession;
    },

    deleteSessionByUserId: async (user_id: string): Promise<Boolean> => {
        const deletedSession = await Session.findOneAndDelete({ user_id });
        return !!deletedSession;
    },

    deleteSessionByToken: async (refresh_token: string): Promise<Boolean> => {
        const deletedSession = await Session.findOneAndDelete({ refresh_token });
        return !!deletedSession;
    },

    deleteExpiredSessions: async (): Promise<number> => {
        const result = await Session.deleteMany({
            expires_at: { $lt: new Date() }
        });
        return result.deletedCount || 0;
    }

};
import { Message, type IMessage } from "../models/message.model";

export const MESSAGE_PROJECTION = {
    _id: 1,
    content: 1,
    type: 1,
    sender: 1,
    community: 1,
    replyTo: 1,
    isEdited: 1,
    isDeleted: 1,
    readBy: 1,
    createdAt: 1,
    updatedAt: 1,
};

export const MessageRepository = {
    createMessage: async (messageData: Partial<IMessage>) => {
        const message = new Message(messageData);
        const savedMessage = await message.save();

        // Populate sender with user details
        const populatedMessage = await Message.findById(savedMessage._id, MESSAGE_PROJECTION)
            .populate("sender", "name username image")
            .populate("replyTo", "content sender")
            .lean();

        // Remove __v field manually
        if (populatedMessage) {
            delete (populatedMessage as any).__v;
        }

        return populatedMessage;
    },

    findMessageById: async (id: string, projection: any = MESSAGE_PROJECTION) => {
        return await Message.findById(id, projection)
            .populate("sender", "name username image")
            .populate("replyTo", "content sender");
    },

    findMessagesByCommunity: async (
        communityId: string,
        limit: number = 50,
        before?: string
    ) => {
        const query: any = { community: communityId, isDeleted: false };

        if (before) {
            query._id = { $lt: before };
        }

        return await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .select(MESSAGE_PROJECTION)
            .populate("sender", "name username image")
            .populate("replyTo", "content sender")
            .lean();
    },

    updateMessageById: async (id: string, updateData: Partial<IMessage>) => {
        return await Message.findByIdAndUpdate(id, updateData, {
            new: true,
            projection: MESSAGE_PROJECTION,
        })
            .populate("sender", "name username image")
            .populate("replyTo", "content sender");
    },

    deleteMessageById: async (id: string) => {
        return await Message.findByIdAndUpdate(
            id,
            { isDeleted: true, content: "[Message deleted]" },
            { new: true }
        );
    },

    markMessageAsRead: async (messageId: string, userId: string) => {
        return await Message.findByIdAndUpdate(
            messageId,
            { $addToSet: { readBy: userId } },
            { new: true }
        );
    },

    countMessagesByCommunity: async (communityId: string) => {
        return await Message.countDocuments({ community: communityId, isDeleted: false });
    },
};

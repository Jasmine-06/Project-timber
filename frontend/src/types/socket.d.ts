// Socket.IO Type Definitions

export interface MessageData {
    _id: string;
    content: string;
    type: "text" | "image" | "file" | "system";
    sender: {
        _id: string;
        username: string;
        name: string;
        profile_picture?: string;
    };
    community: string;
    communityId?: string;
    replyTo?: {
        _id: string;
        content: string;
        sender: {
            _id: string;
            username: string;
        };
    } | null;
    createdAt: string;
    isEdited: boolean;
    isDeleted: boolean;
}

export interface TypingData {
    userId: string;
    username: string;
    communityId: string;
    isTyping: boolean;
}

export interface UserJoinedData {
    userId: string;
    username: string;
    communityId: string;
}

export interface MessageEditedData {
    messageId: string;
    content: string;
    communityId: string;
    isEdited: boolean;
}

export interface MessageDeletedData {
    messageId: string;
    communityId: string;
}

export interface AuthenticatedData {
    userId: string;
    username: string;
    communities: string[];
}

export interface SocketError {
    message: string;
    errors?: any;
}

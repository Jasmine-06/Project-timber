interface IMessage {
    _id: string;
    content: string;
    type: "text" | "image" | "file" | "system";
    sender: {
        _id: string;
        name: string;
        username: string;
        profile_picture?: string;
    };
    community: string;
    replyTo?: string;
    isEdited: boolean;
    isDeleted: boolean;
    readBy: string[];
    createdAt: string;
    updatedAt: string;
}

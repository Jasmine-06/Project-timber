import { useContext, useEffect } from "react";
import { useSocketContext } from "@/context/socket-context";
import { MessageData, TypingData, MessageDeletedData, MessageEditedData, UserJoinedData } from "@/types/socket";
import { socketService } from "@/lib/socket";

export const useSocket = () => {
    return useSocketContext();
};

export const useCommunitySocket = (communityId: string) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (isConnected && communityId) {
            socketService.joinCommunity(communityId);

            return () => {
                socketService.leaveCommunity(communityId);
            };
        }
    }, [isConnected, communityId]);

    const sendMessage = (content: string, type: "text" | "image" | "file" | "system" = "text", replyTo?: string) => {
        socketService.sendMessage(communityId, content, type, replyTo);
    };

    const setTyping = (isTyping: boolean) => {
        socketService.setTyping(communityId, isTyping);
    };

    return {
        sendMessage,
        setTyping,
        isConnected,
        socket
    };
};

export const useSocketEvents = (
    events: {
        onNewMessage?: (data: MessageData) => void;
        onMessageSent?: (data: MessageData) => void;
        onUserTyping?: (data: TypingData) => void;
        onMessageDeleted?: (data: MessageDeletedData) => void;
        onMessageEdited?: (data: MessageEditedData) => void;
        onUserJoined?: (data: UserJoinedData) => void;
    },
    deps: any[] = []
) => {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        if (events.onNewMessage) socketService.onNewMessage(events.onNewMessage);
        if (events.onMessageSent) socketService.onMessageSent(events.onMessageSent);
        if (events.onUserTyping) socketService.onUserTyping(events.onUserTyping);
        if (events.onMessageDeleted) socketService.onMessageDeleted(events.onMessageDeleted);
        if (events.onMessageEdited) socketService.onMessageEdited(events.onMessageEdited);
        if (events.onUserJoined) socketService.onUserJoinedCommunity(events.onUserJoined);

        return () => {
            if (events.onNewMessage) socketService.offNewMessage();
            if (events.onMessageSent) socketService.offMessageSent();
            if (events.onUserTyping) socketService.offUserTyping();
            if (events.onMessageDeleted) socketService.offMessageDeleted();
            if (events.onMessageEdited) socketService.offMessageEdited();
            if (events.onUserJoined) socketService.offUserJoinedCommunity();
        };
    }, [socket, ...deps]);
};

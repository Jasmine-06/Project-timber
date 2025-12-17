import { io, Socket } from "socket.io-client";
import type {
    MessageData,
    TypingData,
    UserJoinedData,
    MessageEditedData,
    MessageDeletedData,
    AuthenticatedData,
    SocketError,
} from "@/types/socket";

// Socket.IO server URL - defaults to backend port 5000
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

class SocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    /**
     * Connect to Socket.IO server and authenticate
     */
    connect(userId: string): Socket {
        // If already connected with same user, return existing socket
        if (this.socket?.connected && this.userId === userId) {
            return this.socket;
        }

        // Disconnect existing connection if any
        this.disconnect();
        this.userId = userId;

        // Create new socket connection
        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        // Setup event listeners
        this.setupEventListeners(userId);

        return this.socket;
    }

    /**
     * Setup core event listeners
     */
    private setupEventListeners(userId: string) {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            console.log("✅ Socket connected:", this.socket?.id);
            this.reconnectAttempts = 0;
            // Authenticate immediately after connection
            this.socket?.emit("authenticate", { userId });
        });

        this.socket.on("authenticated", (data: AuthenticatedData) => {
            console.log("✅ Socket authenticated:", data);
        });

        this.socket.on("error", (error: SocketError) => {
            console.error("❌ Socket error:", error);
            console.log("Socket error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        });

        this.socket.on("disconnect", (reason: string) => {
            console.log("🔌 Socket disconnected:", reason);
        });

        this.socket.on("reconnect", (attemptNumber: number) => {
            console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
        });

        this.socket.on("reconnect_attempt", (attemptNumber: number) => {
            this.reconnectAttempts = attemptNumber;
            console.log("🔄 Reconnect attempt", attemptNumber);
        });

        this.socket.on("reconnect_error", (error: Error) => {
            console.error("❌ Reconnection error:", error);
        });

        this.socket.on("reconnect_failed", () => {
            console.error("❌ Reconnection failed after max attempts");
        });
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.userId = null;
            this.reconnectAttempts = 0;
            console.log("🔌 Socket disconnected manually");
        }
    }

    /**
     * Get current socket instance
     */
    getSocket(): Socket | null {
        return this.socket;
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // ==================== COMMUNITY ACTIONS ====================

    /**
     * Join a community room
     */
    joinCommunity(communityId: string) {
        if (!this.isConnected()) {
            console.warn("⚠️ Socket not connected. Cannot join community.");
            return;
        }
        this.socket?.emit("join-community", { communityId });
    }

    /**
     * Leave a community room
     */
    leaveCommunity(communityId: string) {
        if (!this.isConnected()) {
            console.warn("⚠️ Socket not connected. Cannot leave community.");
            return;
        }
        this.socket?.emit("leave-community", { communityId });
    }

    // ==================== MESSAGE ACTIONS ====================

    /**
     * Send a message to a community
     */
    sendMessage(
        communityId: string,
        content: string,
        type: "text" | "image" | "file" | "system" = "text",
        replyTo?: string
    ) {
        if (!this.isConnected()) {
            console.warn("⚠️ Socket not connected. Cannot send message.");
            return;
        }
        this.socket?.emit("send-message", {
            communityId,
            content,
            type,
            replyTo,
        });
    }

    /**
     * Delete a message
     */
    deleteMessage(messageId: string) {
        if (!this.isConnected()) {
            console.warn("⚠️ Socket not connected. Cannot delete message.");
            return;
        }
        this.socket?.emit("delete-message", { messageId });
    }

    /**
     * Edit a message
     */
    editMessage(messageId: string, content: string) {
        if (!this.isConnected()) {
            console.warn("⚠️ Socket not connected. Cannot edit message.");
            return;
        }
        this.socket?.emit("edit-message", { messageId, content });
    }

    // ==================== TYPING INDICATOR ====================

    /**
     * Set typing indicator
     */
    setTyping(communityId: string, isTyping: boolean) {
        if (!this.isConnected()) return;
        this.socket?.emit("typing", { communityId, isTyping });
    }

    // ==================== EVENT LISTENERS ====================

    /**
     * Listen for new messages
     */
    onNewMessage(callback: (data: MessageData) => void) {
        this.socket?.on("new-message", callback);
    }

    /**
     * Listen for message sent confirmation
     */
    onMessageSent(callback: (data: MessageData) => void) {
        this.socket?.on("message-sent", callback);
    }

    /**
     * Listen for typing indicators
     */
    onUserTyping(callback: (data: TypingData) => void) {
        this.socket?.on("user-typing", callback);
    }

    /**
     * Listen for message deletions
     */
    onMessageDeleted(callback: (data: MessageDeletedData) => void) {
        this.socket?.on("message-deleted", callback);
    }

    /**
     * Listen for message edits
     */
    onMessageEdited(callback: (data: MessageEditedData) => void) {
        this.socket?.on("message-edited", callback);
    }

    /**
     * Listen for users joining community
     */
    onUserJoinedCommunity(callback: (data: UserJoinedData) => void) {
        this.socket?.on("user-joined-community", callback);
    }

    /**
     * Listen for successful community join
     */
    onJoinedCommunity(callback: (data: { communityId: string }) => void) {
        this.socket?.on("joined-community", callback);
    }

    /**
     * Listen for successful community leave
     */
    onLeftCommunity(callback: (data: { communityId: string }) => void) {
        this.socket?.on("left-community", callback);
    }

    /**
     * Listen for socket errors
     */
    onError(callback: (error: SocketError) => void) {
        this.socket?.on("error", callback);
    }

    // ==================== REMOVE LISTENERS ====================

    /**
     * Remove new message listener
     */
    offNewMessage() {
        this.socket?.off("new-message");
    }

    /**
     * Remove message sent listener
     */
    offMessageSent() {
        this.socket?.off("message-sent");
    }

    /**
     * Remove typing listener
     */
    offUserTyping() {
        this.socket?.off("user-typing");
    }

    /**
     * Remove message deleted listener
     */
    offMessageDeleted() {
        this.socket?.off("message-deleted");
    }

    /**
     * Remove message edited listener
     */
    offMessageEdited() {
        this.socket?.off("message-edited");
    }

    /**
     * Remove user joined listener
     */
    offUserJoinedCommunity() {
        this.socket?.off("user-joined-community");
    }

    /**
     * Remove joined community listener
     */
    offJoinedCommunity() {
        this.socket?.off("joined-community");
    }

    /**
     * Remove left community listener
     */
    offLeftCommunity() {
        this.socket?.off("left-community");
    }

    /**
     * Remove error listener
     */
    offError() {
        this.socket?.off("error");
    }

    /**
     * Remove all listeners
     */
    offAll() {
        this.socket?.removeAllListeners();
    }
}

// Export singleton instance
export const socketService = new SocketService();

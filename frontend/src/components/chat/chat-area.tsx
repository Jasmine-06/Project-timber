"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { socketService } from "@/lib/socket";
import { CommunityActions } from "@/api-actions/community-actions";
import { Send, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ChatAreaProps {
    community: ICommunity;
}

export function ChatArea({ community }: ChatAreaProps) {
    const { messages, setMessages, addMessage, typingUsers, setActiveCommunity, activeCommunity } = useChatStore();
    const { user } = useAuthStore();
    const [messageInput, setMessageInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Set active community on mount or change
    useEffect(() => {
        setActiveCommunity(community);
        // Join logic is handled in the page or socket service, 
        // but we can ensure we join here too just in case
        if (socketService.isConnected()) {
            socketService.joinCommunity(community._id);
        }

        return () => {
            // Optional: leave community on unmount
            // socketService.leaveCommunity(community._id);
        };
    }, [community, setActiveCommunity]);

    // Fetch messages when community changes
    useEffect(() => {
        if (community?._id) {
            fetchMessages();
        }
    }, [community?._id]);

    // Setup socket listeners
    useEffect(() => {
        if (!community) return;

        const handleNewMessage = (data: any) => {
            // Check if message belongs to this community
            if (data.community === community._id || data.communityId === community._id) {
                // Avoid duplicates if we already have it (though backend sends distinct events)
                addMessage(data);
            }
        };

        const handleTyping = (data: { userId: string; username: string; communityId: string; isTyping: boolean }) => {
            if (data.communityId === community._id && data.userId !== user?._id) {
                useChatStore.getState().setTypingUser(data.communityId, data.userId, data.username, data.isTyping);
            }
        };

        socketService.onNewMessage(handleNewMessage);
        socketService.onUserTyping(handleTyping);

        return () => {
            socketService.offNewMessage();
            socketService.offUserTyping();
        };
    }, [community, user?._id, addMessage]);

    // Auto scroll to bottom
    useEffect(() => {
        // We access the scroll viewport from the ScrollArea component
        // If ref is attached to the div wrapper
        const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        if (!community) return;

        try {
            setIsLoading(true);
            const data = await CommunityActions.GetCommunityMessagesAction(community._id);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !community || isSending) return;

        const content = messageInput.trim();
        setMessageInput("");
        setIsSending(true);

        try {
            socketService.sendMessage(community._id, content);
            socketService.setTyping(community._id, false);
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessageInput(content);
        } finally {
            setIsSending(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);

        if (!community) return;

        // Send typing indicator
        socketService.setTyping(community._id, true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socketService.setTyping(community._id, false);
        }, 2000);
    };

    const currentTypingUsers = community ? typingUsers[community._id] || [] : [];

    return (
        <div className="flex-1 flex flex-col h-full bg-background rounded-lg border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b flex items-center px-4 gap-3 bg-card/50 backdrop-blur-sm">
                <div className="flex-1">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span className="text-primary">#</span> {community.name}
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {community.members?.length || 0} members
                    </p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 min-h-[300px]">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl">👋</span>
                        </div>
                        <div className="text-center">
                            <p className="font-medium">Welcome to #{community.name}!</p>
                            <p className="text-sm">Be the first to say something.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 min-h-full flex flex-col justify-end">
                        {messages.map((message, index) => {
                            const isOwn = message.sender._id === user?._id;
                            const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id;

                            return (
                                <div
                                    key={message._id || index}
                                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                                >
                                    {showAvatar ? (
                                        <Avatar className="h-8 w-8 mt-1 border">
                                            <AvatarImage src={message.sender?.profile_picture} />
                                            <AvatarFallback className="text-xs">
                                                {message.sender?.username?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="w-8" />
                                    )}
                                    <div className={`max-w-[75%] ${isOwn ? "items-end" : ""}`}>
                                        {showAvatar && (
                                            <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                                                <span className="text-xs font-medium opacity-90">{message.sender?.username}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {message.createdAt && format(new Date(message.createdAt), "HH:mm")}
                                                </span>
                                            </div>
                                        )}
                                        <div
                                            className={`relative rounded-2xl px-4 py-2 text-sm shadow-sm ${isOwn
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : "bg-muted/80 hover:bg-muted rounded-tl-sm transition-colors"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                            {message.isEdited && (
                                                <span className="text-[10px] opacity-70 block text-right mt-1">(edited)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            {/* Typing indicator */}
            {currentTypingUsers.length > 0 && (
                <div className="px-4 py-1 text-xs text-muted-foreground animate-pulse">
                    <span className="font-medium">{currentTypingUsers.map((u) => u.username).join(", ")}</span>
                    {currentTypingUsers.length === 1 ? " is" : " are"} typing...
                </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 pt-2 bg-background border-t">
                <div className="flex gap-2 items-center">
                    <Input
                        placeholder={`Message #${community.name}`}
                        value={messageInput}
                        onChange={handleInputChange}
                        className="flex-1 bg-muted/30 border-muted focus-visible:ring-offset-0 focus-visible:border-primary"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!messageInput.trim() || isSending}
                        className="h-10 w-10 shrink-0 rounded-full transition-all duration-200"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4 ml-0.5" />
                        )}
                        <span className="sr-only">Send message</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}

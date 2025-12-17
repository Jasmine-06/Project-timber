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
import { Send, Hash, Users, Loader2, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function ChatArea() {
  const { activeCommunity, messages, setMessages, addMessage, typingUsers, myCommunities, addCommunity } = useChatStore();
  const { user } = useAuthStore();
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages when community changes
  useEffect(() => {
    if (activeCommunity?._id) {
      // Clear messages immediately when switching communities
      setMessages([]);
      
      fetchMessages();
      if (socketService.isConnected()) {
        socketService.joinCommunity(activeCommunity._id);
      }
    }
    
    // Cleanup: leave community when component unmounts or community changes
    return () => {
      if (activeCommunity?._id && socketService.isConnected()) {
        socketService.leaveCommunity(activeCommunity._id);
      }
    };
  }, [activeCommunity?._id]);

  // Keep track of current community ID to avoid stale closures
  const currentCommunityIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (activeCommunity?._id) {
      currentCommunityIdRef.current = activeCommunity._id;
    }
  }, [activeCommunity?._id]);

  // Setup socket listeners
  useEffect(() => {
    if (!activeCommunity) return;

    const handleNewMessage = (data: any) => {
      console.log('Received new message:', data);
      console.log('Current community ID:', currentCommunityIdRef.current);
      console.log('Message community ID:', data.community || data.communityId);
      
      // Only add message if it belongs to the CURRENT community
      const messageCommunityId = data.community || data.communityId;
      if (messageCommunityId === currentCommunityIdRef.current) {
        console.log('Adding message to store');
        addMessage(data);
      } else {
        console.log('Ignoring message from different community');
      }
    };

    const handleTyping = (data: { userId: string; username: string; communityId: string; isTyping: boolean }) => {
      if (data.communityId === currentCommunityIdRef.current && data.userId !== user?._id) {
        useChatStore.getState().setTypingUser(data.communityId, data.userId, data.username, data.isTyping);
      }
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleTyping);

    return () => {
      socketService.offNewMessage();
      socketService.offUserTyping();
    };
  }, [activeCommunity?._id, user?._id]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!activeCommunity) return;

    try {
      setIsLoading(true);
      const data = await CommunityActions.GetCommunityMessagesAction(activeCommunity._id);
      // Reverse the array to show oldest messages first (chronological order)
      setMessages(data.reverse());
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeCommunity || isSending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    try {
      socketService.sendMessage(activeCommunity._id, content);
      socketService.setTyping(activeCommunity._id, false);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!activeCommunity) return;

    socketService.setTyping(activeCommunity._id, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.setTyping(activeCommunity._id, false);
    }, 2000);
  };

  const handleJoinCommunity = async () => {
    if (!activeCommunity) return;

    try {
      setIsJoining(true);
      await CommunityActions.JoinCommunityAction(activeCommunity._id);
      
      // Fetch the full community details after joining
      const fullCommunity = await CommunityActions.GetCommunityByIdAction(activeCommunity._id);
      addCommunity(fullCommunity);
      toast.success(`Joined ${activeCommunity.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join community");
    } finally {
      setIsJoining(false);
    }
  };

  // Check if user is a member or admin of the active community
  const hasJoined = activeCommunity && user
    ? activeCommunity.members.some((member) => member._id === user._id) ||
      activeCommunity.admins.some((admin) => admin._id === user._id)
    : false;

  const currentTypingUsers = activeCommunity ? typingUsers[activeCommunity._id] || [] : [];

  if (!activeCommunity) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Hash className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Select a Community</h3>
          <p className="text-muted-foreground">Choose a community from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b flex items-center px-4 gap-3 bg-card shrink-0">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{activeCommunity.name}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {activeCommunity.memberCount || activeCommunity.members?.length || 0} members
          </p>
        </div>
        
        {/* Join button - only show if user hasn't joined */}
        {!hasJoined && (
          <Button 
            onClick={handleJoinCommunity}
            disabled={isJoining}
            className="gap-2"
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Join
              </>
            )}
          </Button>
        )}
      </div>

      {/* Messages - with proper scrolling */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Be the first to say something!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender._id === user?._id;
              const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id;
              
              // Create a more robust unique key
              const messageKey = message._id || `${message.createdAt}-${index}` || `msg-${index}`;

              return (
                <div
                  key={messageKey}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {showAvatar ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.sender.profile_picture} />
                      <AvatarFallback className="bg-primary/10">
                        {message.sender.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10" />
                  )}

                  <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                    {showAvatar && (
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-sm font-medium">{message.sender.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), "h:mm a")}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      {message.isEdited && (
                        <span className="text-xs opacity-70">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {currentTypingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground shrink-0">
          {currentTypingUsers.map((u) => u.username).join(", ")}{" "}
          {currentTypingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-card shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageInput}
            onChange={handleInputChange}
            placeholder={`Message #${activeCommunity.name}`}
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!messageInput.trim() || isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}


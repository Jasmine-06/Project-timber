"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { socketService } from "@/lib/socket";
import { CommunityActions } from "@/api-actions/community-actions";
import { Send, Hash, Users, Loader2, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { toast } from "sonner";
import type { UserJoinedData, MessageEditedData, MessageDeletedData } from "@/types/socket";
import { MessageItem } from "./message-item";
import { getTotalMemberCount, getAllUniqueMembers } from "@/lib/community-utils";

export function ChatArea() {
  const { activeCommunity, messages, setMessagesForCommunity, addMessage, updateMessage, typingUsers, updateCommunity, setActiveCommunity, isUserMemberOfCommunity, joinCommunity } = useChatStore();
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
      
      // Always add the message to the store (it will be stored per community)
      // The store will handle showing it only in the correct community
      const messageCommunityId = data.community || data.communityId;
      if (messageCommunityId) {
        console.log('Adding message to store for community:', messageCommunityId);
        addMessage(data);
      } else {
        console.log('Message missing community ID, ignoring');
      }
    };

    const handleTyping = (data: { userId: string; username: string; communityId: string; isTyping: boolean }) => {
      if (data.communityId === currentCommunityIdRef.current && data.userId !== user?._id) {
        useChatStore.getState().setTypingUser(data.communityId, data.userId, data.username, data.isTyping);
      }
    };

    const handleUserJoined = (data: UserJoinedData) => {
      if (data.communityId === currentCommunityIdRef.current && activeCommunity) {
        // Instead of making an API call, just update the member count optimistically
        // The real data will be synced when needed
        const currentCount = activeCommunity.memberCount || getTotalMemberCount(activeCommunity);
        const updatedCommunity = {
          ...activeCommunity,
          memberCount: currentCount + 1
        };
        setActiveCommunity(updatedCommunity);
        updateCommunity(activeCommunity._id, { memberCount: updatedCommunity.memberCount });
      }
    };

    const handleMessageEdited = (data: MessageEditedData) => {
      console.log('Message edited:', data);
      updateMessage(data.messageId, { 
        content: data.content, 
        isEdited: data.isEdited 
      });
    };

    const handleMessageDeleted = (data: MessageDeletedData) => {
      console.log('Message deleted:', data);
      updateMessage(data.messageId, { isDeleted: true });
    };

    const handleMessageRead = (data: { messageId: string; userId: string; username: string }) => {
      console.log('📬 Message read event received:', data);
      if (data.userId !== user?._id) {
        // Find the current message to get its readBy array
        const currentMessage = messages.find(m => m._id === data.messageId);
        console.log('📬 Current message readBy before update:', currentMessage?.readBy);
        if (currentMessage && !currentMessage.readBy?.includes(data.userId)) {
          const newReadBy = [...(currentMessage.readBy || []), data.userId];
          console.log('📬 Updating message readBy to:', newReadBy);
          updateMessage(data.messageId, {
            readBy: newReadBy
          });
        }
      } else {
        console.log('📬 Ignoring own read event');
      }
    };


    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageSent(handleNewMessage); // Handle sender's own messages immediately
    socketService.onUserTyping(handleTyping);
    socketService.onUserJoinedCommunity(handleUserJoined);
    socketService.onMessageEdited(handleMessageEdited);
    socketService.onMessageDeleted(handleMessageDeleted);
    socketService.onMessageRead(handleMessageRead);

    return () => {
      socketService.offNewMessage();
      socketService.offMessageSent();
      socketService.offUserTyping();
      socketService.offUserJoinedCommunity();
      socketService.offMessageEdited();
      socketService.offMessageDeleted();
      socketService.offMessageRead();
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

    // Check if messages are already cached
    const cachedMessages = useChatStore.getState().getMessagesForCommunity(activeCommunity._id);
    if (cachedMessages.length > 0) {
      console.log('Using cached messages for community:', activeCommunity._id);
      return; // Messages already loaded
    }

    try {
      setIsLoading(true);
      const data = await CommunityActions.GetCommunityMessagesAction(activeCommunity._id);
      // Reverse the array to show oldest messages first (chronological order)
      const reversedData = data.reverse();
      setMessagesForCommunity(activeCommunity._id, reversedData);
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

    // Only send typing indicator if user is actually typing (not just focused)
    if (e.target.value.length > 0) {
      socketService.setTyping(activeCommunity._id, true);
    }

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
      const updatedCommunity = await joinCommunity(activeCommunity._id);
      // Update the active community with fresh data that includes the user in members
      setActiveCommunity(updatedCommunity);
      toast.success(`Joined ${activeCommunity.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join community");
    } finally {
      setIsJoining(false);
    }
  };

  // Check if user is a member or admin of the active community
  const hasJoined = activeCommunity && user
    ? isUserMemberOfCommunity(activeCommunity._id, user._id)
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
    <div className="flex-1 chat-container">
      {/* Header */}
      <div className="h-16 border-b flex items-center px-4 gap-3 bg-card shrink-0">
        {activeCommunity.avatar ? (
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage src={activeCommunity.avatar} />
            <AvatarFallback className="bg-primary/10">
              <Hash className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Hash className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="font-semibold">{activeCommunity.name}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {activeCommunity.memberCount || getTotalMemberCount(activeCommunity)} members
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
        className="chat-messages p-4 space-y-4 scroll-smooth"
        style={{ 
          scrollBehavior: 'smooth'
        }}
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
              
              // Check if this is the latest message from this sender
              const isLatestFromSender = !messages.slice(index + 1).some(
                (m) => m.sender._id === message.sender._id
              );
              
              // Create a more robust unique key
              const messageKey = message._id || `${message.createdAt}-${index}` || `msg-${index}`;

              return (
                <MessageItem
                  key={messageKey}
                  message={message}
                  showAvatar={showAvatar}
                  isOwn={isOwn}
                  isLatestFromSender={isLatestFromSender}
                  communityMembers={getAllUniqueMembers(activeCommunity)}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {currentTypingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground flex-shrink-0">
          {currentTypingUsers.map((u) => u.username).join(", ")}{" "}
          {currentTypingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Input */}
      <div className="chat-input p-4 border-t bg-card">
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


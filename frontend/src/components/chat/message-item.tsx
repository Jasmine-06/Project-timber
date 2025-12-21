"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { format } from "date-fns";
import { MoreVertical, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { ReadReceipts } from "./read-receipts";

interface Message {
  _id: string;
  content: string;
  type: string;
  sender: { _id: string; username: string; profile_picture?: string };
  community: string;
  communityId?: string;
  replyTo?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  readBy?: string[];
  createdAt: string;
}

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
  isOwn: boolean;
  isLatestFromSender: boolean;
  communityMembers?: Array<{ _id: string; username: string; profile_picture?: string }>;
}

export function MessageItem({ message, showAvatar, isOwn, isLatestFromSender, communityMembers }: MessageItemProps) {
  const { updateMessage, deleteMessage, editMessage, markMessageAsRead } = useChatStore();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Mark message as read when it comes into view
  useEffect(() => {
    if (user && !message.readBy?.includes(user._id) && !isOwn) {
      console.log('📖 Marking message as read:', message._id, 'by user:', user._id);
      markMessageAsRead(message._id, user._id);
    }
  }, [message._id, user?._id, message.readBy, isOwn, markMessageAsRead]);

  // Debug: Log readBy status for own messages
  useEffect(() => {
    if (isOwn) {
      console.log('👁️ ReadReceipts check:', {
        messageId: message._id,
        isOwn,
        readBy: message.readBy,
        readByLength: message.readBy?.length,
        shouldShow: isOwn && message.readBy && message.readBy.length > 0 && user
      });
    }
  }, [message._id, message.readBy, isOwn, user]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage(message._id, editContent.trim());
      toast.success("Message updated");
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      deleteMessage(message._id);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Don't render deleted messages
  if (message.isDeleted) {
    return (
      <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
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
          <div className="rounded-2xl px-4 py-2 bg-muted/50 border border-dashed">
            <p className="text-sm text-muted-foreground italic">This message was deleted</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}>
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
        
        <div className="relative group">
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={editInputRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-sm bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm break-words">{message.content}</p>
            )}
            
            {message.isEdited && !isEditing && (
              <span className="text-xs opacity-70">(edited)</span>
            )}
          </div>

          {/* Read Receipts - Only show for own messages and only on the latest message */}
          {isOwn && isLatestFromSender && message.readBy && message.readBy.length > 0 && user && (
            <ReadReceipts 
              readBy={message.readBy} 
              currentUserId={user._id}
              communityMembers={communityMembers}
            />
          )}

          {/* Message Actions - Only show for own messages */}
          {isOwn && !isEditing && (
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0 rounded-full"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Unsend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
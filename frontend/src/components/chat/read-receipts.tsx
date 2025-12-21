"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye } from "lucide-react";

interface ReadReceiptsProps {
  readBy: string[];
  currentUserId: string;
  communityMembers?: Array<{ _id: string; username: string; profile_picture?: string }>;
}

export function ReadReceipts({ readBy, currentUserId, communityMembers }: ReadReceiptsProps) {
  // Filter out current user from read receipts
  const otherReaders = readBy.filter(userId => userId !== currentUserId);
  
  if (otherReaders.length === 0) {
    return null;
  }

  // Get member details for readers
  const readers = otherReaders.map(userId => {
    const member = communityMembers?.find(m => m._id === userId);
    return member || { _id: userId, username: 'Unknown', profile_picture: undefined };
  });

  const displayReaders = readers.slice(0, 3); // Show max 3 avatars
  const remainingCount = readers.length - displayReaders.length;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 mt-1">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <div className="flex -space-x-1">
              {displayReaders.map((reader) => (
                <Avatar key={reader._id} className="h-4 w-4 border border-background">
                  <AvatarImage src={reader.profile_picture} />
                  <AvatarFallback className="text-xs">
                    {reader.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {remainingCount > 0 && (
                <div className="h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{remainingCount}</span>
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">Read by:</p>
            <ul className="mt-1">
              {readers.map((reader) => (
                <li key={reader._id}>{reader.username}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
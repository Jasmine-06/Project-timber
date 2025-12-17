"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { socketService } from "@/lib/socket";
import { ChatArea } from "@/components/chat/chat-area";
import { CommunityMembers } from "@/components/chat/community-members";
import { useChatStore } from "@/store/chat-store";
import { Loader2 } from "lucide-react";

export default function CommunityChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { activeCommunity } = useChatStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize Socket.IO connection
      if (!socketService.isConnected()) {
        socketService.connect(user._id);
      }
    }

    return () => {
      // Cleanup on unmount
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-background flex overflow-hidden">
      <ChatArea />
      {activeCommunity && <CommunityMembers community={activeCommunity} />}
    </div>
  );
}

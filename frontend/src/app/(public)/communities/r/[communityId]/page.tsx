"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { socketService } from "@/lib/socket";
import { CommunityActions } from "@/api-actions/community-actions";
import { ChatArea } from "@/components/chat/chat-area";
import { CommunityMembers } from "@/components/chat/community-members";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const { activeCommunity, setActiveCommunity } = useChatStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!socketService.isConnected()) {
        socketService.connect(user._id);
      }
    }

    return () => {
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Fetch and set active community
  useEffect(() => {
    async function fetchCommunity() {
      try {
        const data = await CommunityActions.GetCommunityByIdAction(communityId);
        setActiveCommunity(data);
      } catch (error) {
        console.error("Failed to fetch community:", error);
        toast.error("Failed to load community");
        router.push("/communities");
      }
    }

    if (communityId && isAuthenticated) {
      fetchCommunity();
    }
  }, [communityId, isAuthenticated, setActiveCommunity, router]);

  if (authLoading) {
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
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-background">
      <ChatArea />
      {activeCommunity && <CommunityMembers community={activeCommunity} />}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ParticleButton from "@/components/kokonutui/particle-button";
import { useParams } from "next/navigation";
import { CommunityActions } from "@/api-actions/community-actions";
import { ChatArea } from "@/components/chat/chat-area";
import { Loader2 } from "lucide-react";

export default function CommunityPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunity() {
      try {
        setLoading(true);
        const data = await CommunityActions.GetCommunityByIdAction(communityId);
        setCommunity(data);
      } catch (error) {
        console.error("Failed to fetch community:", error);
      } finally {
        setLoading(false);
      }
    }

    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Community not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Community Header */}
      <div className="bg-card border-b border-border shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Community Avatar */}
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                {community.avatar ? (
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage src={community.avatar} />
                    <AvatarFallback className="bg-transparent text-white text-2xl rounded-lg">
                      {community.name?.charAt(0).toUpperCase() || "#"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="text-3xl text-white font-bold">
                    {community.name?.charAt(0).toUpperCase() || "#"}
                  </span>
                )}
              </div>

              {/* Community Info */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{community.name}</h1>
                <p className="text-sm text-muted-foreground">{community.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <ParticleButton 
              variant="outline" 
              size="default" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
            >
              Join
            </ParticleButton>
          </div>
        </div>
      </div>

      {/* Community Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 h-full flex flex-col">
          <ChatArea community={community} />
        </div>
      </div>
    </div>
  );
}

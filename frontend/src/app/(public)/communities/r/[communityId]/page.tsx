"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ParticleButton from "@/components/kokonutui/particle-button";
import { Bell, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";

// Mock data - replace with actual API call
const communityData: Record<string, { name: string; icon: string; description: string; members: string }> = {
  "1": { name: "r/funny", icon: "😄", description: "Reddit's largest humor depository", members: "67M" },
  "2": { name: "r/AskReddit", icon: "❓", description: "r/AskReddit is the place to ask...", members: "57M" },
  "3": { name: "r/gaming", icon: "🎮", description: "The Number One Gaming forum...", members: "47M" },
};

export default function CommunityPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const community = communityData[communityId] || { name: "r/community", icon: "🌟", description: "Community", members: "0" };

  return (
    <div className="min-h-screen bg-background">
      {/* Community Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Community Avatar */}
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-muted text-foreground text-2xl border border-border">
                  {community.icon}
                </AvatarFallback>
              </Avatar>

              {/* Community Info */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{community.name}</h1>
              </div>
            </div>

            {/* Action Buttons */}
            <ParticleButton variant="outline" size="default" className="bg-black text-white rounded-full">
              Join
            </ParticleButton>


          </div>
        </div>
      </div>

      {/* Community Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center text-muted-foreground py-12">
          <p>Community content will be displayed here</p>
          <p className="text-sm mt-2">{community.members} members</p>
        </div>
      </div>
    </div>
  );
}

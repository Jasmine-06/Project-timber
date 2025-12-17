"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CommunityActions } from "@/api-actions/community-actions";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export default function CommunitiesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: communitiesResponse, isLoading } = useQuery({
    queryKey: ["communities", "all", debouncedSearch],
    queryFn: () => CommunityActions.GetAllCommunitiesAction(1, 50, debouncedSearch),
  });

  const communities = communitiesResponse?.communities || [];

  const handleCommunityClick = (communityId: string) => {
    router.push(`/communities/r/${communityId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-1">Top Communities</h1>
            <p className="text-sm text-muted-foreground">Timber's largest communities</p>
          </div>
          <div className="w-full md:w-64">
            <Input
              placeholder="Search communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted/50"
            />
          </div>
        </div>
      </div>

      {/* Communities List */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No communities found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            {communities.map((community, index) => (
              <div
                key={community._id}
                className="flex items-start gap-2 p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleCommunityClick(community._id)}
              >
                {/* Rank Number */}
                <div className="text-sm font-medium text-muted-foreground min-w-[24px] pt-1">
                  {index + 1}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={community.avatar || community.image} alt={community.name} />
                  <AvatarFallback className="bg-muted text-foreground text-lg border border-border">
                    {/* Fallback to first letter or emoji if name is "r/..." */}
                    {community.name.replace("r/", "").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Community Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-medium text-sm text-foreground truncate hover:underline"
                  >
                    {community.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {community.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {community.memberCount || community.members?.length || 0} members
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
